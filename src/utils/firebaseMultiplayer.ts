import { signInAnonymously } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import type { RoomState, Team, TeamAnswerSubmission } from '../types';
import { firebaseApp, firebaseAuth, isFirebaseAuthConfigured } from './firebaseAuth';

export const isFirebaseMultiplayerConfigured = isFirebaseAuthConfigured && !!firebaseApp;
const db = firebaseApp ? getFirestore(firebaseApp) : null;

const clean = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const roomRef = (code: string) => doc(db!, 'quizRooms', code.toUpperCase());

const ensureUser = async () => {
  if (!firebaseAuth || !db) throw new Error('Firebase multiplayer is not configured.');
  await firebaseAuth.authStateReady();
  if (!firebaseAuth.currentUser) await signInAnonymously(firebaseAuth);
  if (!firebaseAuth.currentUser) throw new Error('Unable to start a secure guest session.');
  return firebaseAuth.currentUser;
};

const randomCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
};

export const publicRoomState = (source: RoomState): RoomState => {
  const room = clean(source);
  const revealing = room.status === 'answer_reveal' || room.status === 'game_over' || room.status === 'knockout_winner';
  room.rounds.forEach((round, roundIndex) => round.questions.forEach((question, questionIndex) => {
    const isCurrent = roundIndex === room.currentRoundIndex && questionIndex === room.currentQuestionIndex;
    if (!revealing || !isCurrent) {
      question.correctAnswer = '';
      question.acceptableAnswers = [];
      question.explanation = undefined;
    }
  }));
  Object.values(room.submissions).forEach((submission) => {
    if (!revealing) {
      submission.isCorrect = undefined;
      submission.pointsAwarded = undefined;
      submission.reviewedByHost = undefined;
    }
  });
  return clean(room);
};

export const createFirebaseRoom = async (initial: RoomState): Promise<RoomState> => {
  const user = await ensureUser();
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const code = randomCode();
    const target = roomRef(code);
    if ((await getDoc(target)).exists()) continue;
    const room = { ...initial, code };
    await setDoc(target, {
      state: publicRoomState(room),
      hostState: clean(room),
      hostUid: user.uid,
      updatedAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    });
    return room;
  }
  throw new Error('Unable to create a unique lobby code.');
};

export const publishFirebaseRoom = async (room: RoomState): Promise<void> => {
  const user = await ensureUser();
  const existing = await getDoc(roomRef(room.code));
  if (existing.exists() && existing.data().hostUid !== user.uid) {
    throw new Error('Only the original Quiz Master can update this lobby.');
  }
  await setDoc(roomRef(room.code), {
    state: publicRoomState(room),
    hostState: clean(room),
    hostUid: user.uid,
    updatedAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
  }, { merge: true });
};

export const findFirebaseHostRoom = async (code: string): Promise<RoomState> => {
  const user = await ensureUser();
  const snapshot = await getDoc(roomRef(code));
  if (!snapshot.exists()) throw new Error('Your previous lobby has expired.');
  const data = snapshot.data();
  if (data.hostUid !== user.uid) throw new Error('This lobby belongs to another Quiz Master.');
  const room = (data.hostState || data.state) as RoomState | undefined;
  if (!room) throw new Error('The Quiz Master room could not be restored.');
  return room;
};

export const findFirebaseRoom = async (code: string): Promise<RoomState> => {
  await ensureUser();
  const snapshot = await getDoc(roomRef(code));
  if (!snapshot.exists()) throw new Error('Room not found. Check the code with the Quiz Master.');
  return snapshot.data().state as RoomState;
};

export const subscribeFirebaseRoom = async (
  code: string,
  onState: (room: RoomState) => void,
  onError: (error: Error) => void,
): Promise<Unsubscribe> => {
  await ensureUser();
  return onSnapshot(roomRef(code), (snapshot) => {
    if (!snapshot.exists()) return onError(new Error('This lobby has closed.'));
    onState(snapshot.data().state as RoomState);
  }, (error) => onError(error));
};

export const joinFirebaseTeam = async (
  code: string,
  team: { teamId: string; name: string; avatar: string },
): Promise<void> => {
  const user = await ensureUser();
  await setDoc(doc(db!, 'quizRooms', code, 'joinRequests', user.uid), {
    ...team,
    memberUid: user.uid,
    joinedAt: Date.now(),
  });
};

export const leaveFirebaseTeam = async (code: string): Promise<void> => {
  if (!firebaseAuth?.currentUser || !db || !code) return;
  await deleteDoc(doc(db, 'quizRooms', code, 'joinRequests', firebaseAuth.currentUser.uid)).catch(() => undefined);
};

export const submitFirebaseAnswer = async (
  code: string,
  teamId: string,
  teamName: string,
  answer: string,
  questionKey: string,
): Promise<void> => {
  const user = await ensureUser();
  await setDoc(doc(db!, 'quizRooms', code, 'submissions', user.uid), {
    teamId,
    teamName,
    answer,
    questionKey,
    submittedAt: Date.now(),
    memberUid: user.uid,
  });
};

export const subscribeFirebaseHostActivity = async (
  code: string,
  onJoins: (teams: Record<string, Team>) => void,
  onSubmissions: (submissions: Array<TeamAnswerSubmission & { questionKey: string }>) => void,
  onError: (error: Error) => void,
): Promise<Unsubscribe> => {
  await ensureUser();
  const joins = collection(db!, 'quizRooms', code, 'joinRequests');
  const submissions = collection(db!, 'quizRooms', code, 'submissions');
  const unsubscribeJoins = onSnapshot(joins, (snapshot) => {
    const grouped: Record<string, Team> = {};
    snapshot.docs.forEach((entry) => {
      const item = entry.data() as { teamId: string; name: string; avatar: string };
      const existing = grouped[item.teamId];
      if (existing) {
        existing.connectedPlayers = (existing.connectedPlayers || 0) + 1;
      } else {
        grouped[item.teamId] = {
          id: item.teamId,
          name: item.name,
          avatar: item.avatar,
          color: '#F59E0B',
          score: 0,
          isOnline: true,
          connectedPlayers: 1,
          scoreHistory: [],
        };
      }
    });
    onJoins(grouped);
  }, (error) => onError(error));
  const unsubscribeSubmissions = onSnapshot(submissions, (snapshot) => {
    onSubmissions(snapshot.docs.map((entry) => entry.data() as TeamAnswerSubmission & { questionKey: string }));
  }, (error) => onError(error));
  return () => {
    unsubscribeJoins();
    unsubscribeSubmissions();
  };
};

export const clearFirebaseRoomActivity = async (code: string): Promise<void> => {
  await ensureUser();
  for (const child of ['submissions']) {
    const snapshot = await getDocs(collection(db!, 'quizRooms', code, child));
    await Promise.all(snapshot.docs.map((entry) => deleteDoc(entry.ref)));
  }
};
