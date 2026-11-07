import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Public web configuration; credentials and payment secrets never go here.
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBU4M339PPVUEdhG3LWLsAmMuMbmC4e5PQ',
  authDomain: 'visualizer.pro',
  projectId: 'teemtreat-visualizer',
  storageBucket: 'teemtreat-visualizer.firebasestorage.app',
  messagingSenderId: '209065055325',
  appId: '1:209065055325:web:b29889d959eb39a48ca9b4',
  measurementId: 'G-N7TMKW7YXH',
});
// Unique users are counted from Google Analytics page views (measurementId above).
isSupported().then(ok => { if (ok) getAnalytics(app); }).catch(() => {});
export const auth = getAuth(app);
const functions = getFunctions(app, 'asia-south1');
export const backendEnabled = import.meta.env.VITE_ACCESS_BACKEND_ENABLED === 'true';
export const checkoutEnabled = backendEnabled && import.meta.env.VITE_CHECKOUT_ENABLED === 'true';
export const googleSignIn = () => signInWithPopup(auth, new GoogleAuthProvider());
export async function accessCall(name, data = {}) {
  if (!backendEnabled) throw new Error('Account access is being set up. Please try again later.');
  return (await httpsCallable(functions, name)(data)).data;
}
