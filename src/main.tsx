import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Reload once when an updated service worker takes control so an open or
// installed copy cannot keep running an older hashed JavaScript bundle.
let hasReloadedForNewWorker = false;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloadedForNewWorker) return;
    hasReloadedForNewWorker = true;
    window.location.reload();
  });
}

// Activate each new GitHub Pages build immediately, including installed PWAs.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    void updateSW(true);
  },
  onRegisteredSW(_swUrl, registration) {
    void registration?.update();
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
