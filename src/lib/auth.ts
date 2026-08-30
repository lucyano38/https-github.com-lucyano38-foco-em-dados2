import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const ensureApp = () => {
  try {
    return getApps().length === 0 ? initializeApp(firebaseConfig as any) : getApps()[0];
  } catch {
    return initializeApp({ projectId: 'foco-em-dados-fallback' }) as FirebaseApp;
  }
};

const app = ensureApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = () => onAuthStateChanged(auth, async (user: User | null) => {
  if (user) {
    cachedAccessToken = null;
  } else {
    cachedAccessToken = null;
  }
});

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    let result;
    try {
      result = await signInWithPopup(auth, provider);
    } catch (popupError: any) {
      console.warn('Popup blocked or failed, attempting redirect signIn...', popupError);
      // Fallback para redirect se o popup for bloqueado
      await signInWithRedirect(auth, provider);
      return null;
    }

    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Falha ao obter token de acesso do Google Auth.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    alert('Erro no login com Google: ' + (error.message || error));
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
