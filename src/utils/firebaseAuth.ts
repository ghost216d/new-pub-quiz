import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth,
  linkWithPopup,
  signInWithPopup,
  signOut,
  type AuthProvider,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

export const isFirebaseAuthConfigured = Object.values(firebaseConfig).every(Boolean);

const app = isFirebaseAuthConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

export const firebaseAuth = app ? getAuth(app) : null;

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');

function requireAuth() {
  if (!firebaseAuth) {
    throw new Error('Secure sign-in is being configured. Please try again shortly.');
  }
  return firebaseAuth;
}

async function signIn(provider: AuthProvider): Promise<User> {
  const result = await signInWithPopup(requireAuth(), provider);
  return result.user;
}

export const signInWithGoogle = () => signIn(googleProvider);

export async function signInWithFacebook(): Promise<User> {
  const auth = requireAuth();
  if (auth.currentUser) {
    const result = await linkWithPopup(auth.currentUser, facebookProvider);
    return result.user;
  }
  return signIn(facebookProvider);
}

export async function signOutFromFirebase() {
  await signOut(requireAuth());
}

export function friendlyAuthError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';

  const messages: Record<string, string> = {
    'auth/popup-closed-by-user': 'Sign-in was cancelled before it finished.',
    'auth/cancelled-popup-request': 'Only one sign-in window can be open at a time.',
    'auth/popup-blocked': 'Your browser blocked the sign-in window. Please allow pop-ups and try again.',
    'auth/account-exists-with-different-credential': 'This email already uses another sign-in method. Sign in with that provider first, then link Facebook.',
    'auth/unauthorized-domain': 'This website has not yet been authorised in Firebase Authentication.',
    'auth/operation-not-allowed': 'This sign-in provider has not yet been enabled in Firebase.',
    'auth/network-request-failed': 'The sign-in service could not be reached. Check your internet connection and try again.',
  };

  return messages[code] || (error instanceof Error ? error.message : 'Sign-in failed. Please try again.');
}
