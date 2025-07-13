import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Debug: Log environment variables
console.log('Firebase Config - Environment Variables:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '***' : 'MISSING',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'MISSING',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'MISSING',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '***' : 'MISSING'
});

// Temporary hardcoded config for testing
const firebaseConfig = {
  apiKey: "AIzaSyAWbZOU6VSrRstaD8zSLdgP43lB7gLFcyM",
  authDomain: "sirschedule-main.firebaseapp.com",
  projectId: "sirschedule-main",
  storageBucket: "sirschedule-main.firebasestorage.app",
  messagingSenderId: "805504517006",
  appId: "1:805504517006:web:2174408ccf812590dfdadf"
};

console.log('Using hardcoded Firebase config');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
