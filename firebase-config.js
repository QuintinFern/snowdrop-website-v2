// --- CORRECT IMPORTS FOR BROWSERS (DO NOT CHANGE THESE URLs) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzwB9rLvP7hdeUitznATJZTP8W_3J62Go",
  authDomain: "snowdrop-united-social-website.firebaseapp.com",
  projectId: "snowdrop-united-social-website",
  storageBucket: "snowdrop-united-social-website.firebasestorage.app",
  messagingSenderId: "497770313012",
  appId: "1:497770313012:web:a049acc032bae59671e161"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  app,
  auth,
  db,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  where,
  Timestamp,
  ref,
  uploadBytes,
  getDownloadURL,
};
