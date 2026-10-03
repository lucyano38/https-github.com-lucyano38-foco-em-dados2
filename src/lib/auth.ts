import { auth, googleProvider, githubProvider, microsoftProvider } from './firebase';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type UserCredential
} from 'firebase/auth';

export { auth, googleProvider, githubProvider, microsoftProvider };

export async function loginWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

export async function loginWithGithub(): Promise<UserCredential> {
  return signInWithPopup(auth, githubProvider);
}

export async function loginWithMicrosoft(): Promise<UserCredential> {
  return signInWithPopup(auth, microsoftProvider);
}

export async function logout(): Promise<void> {
  localStorage.removeItem('foco_em_dados_user_email');
  localStorage.removeItem('foco_usuario_email');
  localStorage.removeItem('foco_usuario');
  return firebaseSignOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
