import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import WebSocket from 'ws';

const port = 4197;
const server = spawn(process.execPath, ['dist/server.cjs'], {
  env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe'],
});

const waitForServer = () => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Server did not start.')), 8000);
  server.stdout.on('data', (chunk) => {
    if (String(chunk).includes('running on port')) {
      clearTimeout(timeout);
      resolve();
    }
  });
  server.stderr.on('data', (chunk) => process.stderr.write(chunk));
  server.on('exit', (code) => reject(new Error(`Server exited early with ${code}.`)));
});

const waitForState = (ws, predicate = () => true) => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Timed out waiting for room state.')), 5000);
  const listener = (raw) => {
    const message = JSON.parse(String(raw));
    if (message.type === 'error') {
      clearTimeout(timeout);
      ws.off('message', listener);
      reject(new Error(message.message));
    }
    if (message.type === 'room_state' && predicate(message.state)) {
      clearTimeout(timeout);
      ws.off('message', listener);
      resolve(message.state);
    }
  };
  ws.on('message', listener);
});

const connect = async (roomCode, role, team) => {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });
  const statePromise = waitForState(ws);
  ws.send(JSON.stringify({ type: 'join_room', roomCode, role, team }));
  return { ws, state: await statePromise };
};

const sockets = [];
try {
  await waitForServer();
  const created = await fetch(`http://127.0.0.1:${port}/api/rooms`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ hostName: 'Test Host', maxTeams: 10 }),
  }).then((response) => response.json());

  const host = await connect(created.roomCode, 'host');
  const playerOne = await connect(created.roomCode, 'player', { teamId: 'shared-team', name: 'The Mates', avatar: '🍺' });
  const playerTwo = await connect(created.roomCode, 'player', { teamId: 'shared-team', name: 'Ignored Rename', avatar: '👑' });
  sockets.push(host.ws, playerOne.ws, playerTwo.ws);

  const twoPlayerState = await waitForState(host.ws, (state) => state.teams['shared-team']?.connectedPlayers === 2);
  assert.equal(Object.keys(twoPlayerState.teams).length, 1, 'two devices should share one team');
  assert.equal(twoPlayerState.teams['shared-team'].name, 'The Mates', 'joining a team must not rename it');
  assert.equal(playerTwo.state.rounds[0].questions[0].correctAnswer, '', 'player must not receive the correct answer early');

  const lobby = await fetch(`http://127.0.0.1:${port}/api/rooms/${created.roomCode}`).then((response) => response.json());
  assert.equal(lobby.teams['shared-team'].connectedPlayers, 2);
  assert.equal('rounds' in lobby, false, 'room lookup must not expose questions');

  const afterDisconnect = waitForState(host.ws, (state) => state.teams['shared-team']?.connectedPlayers === 1);
  playerTwo.ws.close();
  const onePlayerState = await afterDisconnect;
  assert.equal(onePlayerState.teams['shared-team'].isOnline, true, 'one disconnect must not take the whole team offline');

  console.log('Multiplayer smoke test passed.');
} finally {
  sockets.forEach((socket) => socket.close());
  server.kill('SIGTERM');
}
