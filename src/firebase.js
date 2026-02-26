import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyADeE78Dv1AMNsDXuvEkj0oU-Fh2M0Jsa4",
  authDomain: "gonab-app.firebaseapp.com",
  projectId: "gonab-app",
  storageBucket: "gonab-app.firebasestorage.app",
  messagingSenderId: "260585496864",
  appId: "1:260585496864:web:3dc151ae2c2a95379bb745",
  measurementId: "G-S34JW64LYN"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'gonab-app';
