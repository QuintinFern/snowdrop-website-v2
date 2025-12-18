// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzwB9rLvP7hdeUitznATJZTP8W_3J62Go",
  authDomain: "snowdrop-united-social-website.firebaseapp.com",
  projectId: "snowdrop-united-social-website",
  storageBucket: "snowdrop-united-social-website.firebasestorage.app",
  messagingSenderId: "497770313012",
  appId: "1:497770313012:web:a049acc032bae59671e161",
  measurementId: "G-S20EMD150E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);