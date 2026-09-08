import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "extended-airship-3f6jr",
  appId: "1:38780028533:web:356bca0a38a19323551a3c",
  apiKey: "AIzaSyAsxlt1vsbFte9gZ4f8orLOk6hIvnNew2E",
  authDomain: "extended-airship-3f6jr.firebaseapp.com",
  storageBucket: "extended-airship-3f6jr.firebasestorage.app",
  messagingSenderId: "38780028533"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-skyblueagency-ad901c14-c882-4831-aaf5-91c0d0ec9f05");
