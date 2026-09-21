import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace with actual Firebase project config if not using TEST_MODE
const firebaseConfig = {
  apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY || "dummy",
  authDomain: import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "dummy",
  projectId: import.meta.env.REACT_APP_FIREBASE_PROJECT_ID || "dummy",
  storageBucket: import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "dummy",
  messagingSenderId: import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "dummy",
  appId: import.meta.env.REACT_APP_FIREBASE_APP_ID || "dummy"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
