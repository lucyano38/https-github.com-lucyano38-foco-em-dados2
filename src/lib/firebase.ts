/**
 * Centralized Firebase initialization.
 * Every other module should import `app` (and optionally `auth`/`db`) from here
 * instead of calling initializeApp() independently.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig as any) : getApps()[0];

/** Firebase Auth instance — shared across the entire app. */
export const auth: Auth = getAuth(app);

/** Firestore instance — shared across the entire app. */
export const db: Firestore = getFirestore(
  app,
  (firebaseConfig as any).firestoreDatabaseId || undefined,
);

export default app;
