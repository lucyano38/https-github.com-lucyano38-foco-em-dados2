import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
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

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const token = await user.getIdToken();
      cachedAccessToken = token;
      if (onAuthSuccess) onAuthSuccess(user, token);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithSocial = async (providerName: 'google' | 'github' | 'microsoft'): Promise<User> => {
  let provider = googleProvider;
  if (providerName === 'github') provider = githubProvider;
  if (providerName === 'microsoft') provider = microsoftProvider;

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (popupErr: any) {
    console.warn('Popup blocked, trying redirect...', popupErr);
    await signInWithRedirect(auth, provider);
    throw new Error('Redirecionando para autenticação...');
  }
};

export const signUpOrSignInWithEmail = async (email: string, pass: string, isSignUp: boolean): Promise<User> => {
  if (isSignUp) {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await sendEmailVerification(cred.user);
    alert('Cadastro realizado! Enviamos um e-mail de verificação para ' + email + '. Por favor, confirme para ativar sua conta.');
    return cred.user;
  } else {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  }
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  localStorage.removeItem('foco_em_dados_auth');
  localStorage.removeItem('foco_usuario');
};
