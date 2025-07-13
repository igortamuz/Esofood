import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAtmM-ml7LJsUhQWNLd8uT9KG-nx2-2cUs",
  authDomain: "esafood-d8508.firebaseapp.com",
  projectId: "esafood-d8508",
  storageBucket: "esafood-d8508.firebasestorage.app",
  messagingSenderId: "528934758817",
  appId: "1:528934758817:web:8bb5702db74e4f358d03e0"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };