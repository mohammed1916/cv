import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Public web configuration; credentials and payment secrets never go here.
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBU4M339PPVUEdhG3LWLsAmMuMbmC4e5PQ',
  authDomain: 'teemtreat-visualizer.firebaseapp.com',
  projectId: 'teemtreat-visualizer',
});
export const auth = getAuth(app);
const functions = getFunctions(app, 'asia-south1');
export const backendEnabled = import.meta.env.VITE_ACCESS_BACKEND_ENABLED === 'true';
export const checkoutEnabled = backendEnabled && import.meta.env.VITE_CHECKOUT_ENABLED === 'true';
export const googleSignIn = () => signInWithPopup(auth, new GoogleAuthProvider());
export async function accessCall(name, data = {}) {
  if (!backendEnabled) throw new Error('Account access is being set up. Please try again later.');
  return (await httpsCallable(functions, name)(data)).data;
}
