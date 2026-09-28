import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
];

const provider = new GoogleAuthProvider();
GMAIL_SCOPES.forEach((scope) => provider.addScope(scope));
// Force account selection so coordinator can choose their exact email address
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory token cache (strictly NO localStorage as per security skill)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getCachedAccessToken = () => cachedAccessToken;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleGmail = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (!token) {
      throw new Error("Impossible d'obtenir le jeton d'accès Google Gmail.");
    }

    cachedAccessToken = token;
    return { user: result.user, accessToken: token };
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogle = async () => {
  cachedAccessToken = null;
  await firebaseSignOut(auth);
};
