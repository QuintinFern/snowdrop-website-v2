// --- CORRECT IMPORTS FOR BROWSERS (DO NOT CHANGE THESE URLs) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- YOUR CONFIGURATION ---
// Go to Firebase Console > Project Settings > General > Your Apps to find these values
const firebaseConfig = {
  apiKey: "AIzaSyBzwB9rLvP7hdeUitznATJZTP8W_3J62Go",
  authDomain: "snowdrop-united-social-website.firebaseapp.com",
  projectId: "snowdrop-united-social-website",
  storageBucket: "snowdrop-united-social-website.firebasestorage.app",
  messagingSenderId: "497770313012",
  appId: "1:497770313012:web:a049acc032bae59671e161"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export tools so other files can use them
export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp };