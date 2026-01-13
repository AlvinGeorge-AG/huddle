// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyBAz32A7HTq4lhiaKTZFtQMJB5NgNriEh4",
  authDomain: "huddle-chat-6dfb7.firebaseapp.com",
  projectId: "huddle-chat-6dfb7",
  storageBucket: "huddle-chat-6dfb7.firebasestorage.app",
  messagingSenderId: "450832618076",
  appId: "1:450832618076:web:87c4ef1af5497c5bd08c99"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);