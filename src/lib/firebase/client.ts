// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCILuq1iVL_FNbmzvVzmtwEja0oKUePeEA",
  authDomain: "osama-2020.firebaseapp.com",
  projectId: "osama-2020",
  storageBucket: "osama-2020.appspot.com",
  messagingSenderId: "390287828886",
  appId: "1:390287828886:web:a12a3240c4974128f731e6"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
