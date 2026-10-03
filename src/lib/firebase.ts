/**
 * Centralized Firebase initialization.
 * Imports and initializes Firebase using VITE_FIREBASE_* environment variables,
 * with graceful fallback to firebase-applet-config.json.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  type Auth
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import firebaseConfigFallback from '../../firebase-applet-config.json';

const isValidValue = (val?: string) =>
  val &&
  !val.includes('sua_chave') &&
  !val.includes('seu-projeto') &&
  !val.includes('G-XXXXXXXXXX')
    ? val
    : undefined;

const firebaseConfig = {
  apiKey: isValidValue(import.meta.env.VITE_FIREBASE_API_KEY) || (firebaseConfigFallback as any)?.apiKey,
  authDomain: isValidValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || (firebaseConfigFallback as any)?.authDomain,
  databaseURL: isValidValue(import.meta.env.VITE_FIREBASE_DATABASE_URL) || (firebaseConfigFallback as any)?.databaseURL,
  projectId: isValidValue(import.meta.env.VITE_FIREBASE_PROJECT_ID) || (firebaseConfigFallback as any)?.projectId,
  storageBucket: isValidValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || (firebaseConfigFallback as any)?.storageBucket,
  messagingSenderId: isValidValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || (firebaseConfigFallback as any)?.messagingSenderId,
  appId: isValidValue(import.meta.env.VITE_FIREBASE_APP_ID) || (firebaseConfigFallback as any)?.appId,
  measurementId: isValidValue(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) || (firebaseConfigFallback as any)?.measurementId,
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig as any) : getApps()[0];

/** Firebase Auth instance — shared across the entire app. */
export const auth: Auth = getAuth(app);

/** Google Auth Provider instance configured with default scopes. */
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** GitHub Auth Provider instance */
export const githubProvider: GithubAuthProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

/** Microsoft OAuth Provider instance */
export const microsoftProvider: OAuthProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({
  prompt: 'select_account',
});

/** Firestore instance — shared across the entire app. */
const firestoreDbId = (firebaseConfigFallback as any)?.firestoreDatabaseId || undefined;
export const db: Firestore = getFirestore(app, firestoreDbId);

export default app;
