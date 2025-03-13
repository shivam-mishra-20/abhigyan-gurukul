import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore
import { getAuth } from "firebase/auth"; // Authentication (if needed)

// 🔥 Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCVj7X7CRTByLG7YF3IlYNofMVFI5D41Kk",
  authDomain: "abhigyan-gurukul.firebaseapp.com",
  projectId: "abhigyan-gurukul",
  storageBucket: "abhigyan-gurukul.firebasestorage.app",
  messagingSenderId: "871374608648",
  appId: "1:871374608648:web:fc1124bba966c56d63f4bd",
  measurementId: "G-93N8W9YQPZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // If authentication is needed

export { app, db, auth };
