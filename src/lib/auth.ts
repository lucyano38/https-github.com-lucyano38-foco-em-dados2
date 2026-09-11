import { auth } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  OAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth';

export { auth };

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function loginWithGithub() {
  const provider = new GithubAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function loginWithMicrosoft() {
  const provider = new OAuthProvider('microsoft.com');
  return signInWithPopup(auth, provider);
}

export async function logout() {
  return firebaseSignOut(auth);
}
