import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCx36ICQWoQhE2EdMUznnkOL0uJVFLRFLw",
  authDomain: "agendaparroquiasantodomingo.firebaseapp.com",
  projectId: "agendaparroquiasantodomingo",
  storageBucket: "agendaparroquiasantodomingo.firebasestorage.app",
  messagingSenderId: "946455167055",
  appId: "1:946455167055:web:c020634e0b52a2bbd42a3a",
  measurementId: "G-9BG245L2D9"
};

// Initialize Firebase only if there are no apps initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
