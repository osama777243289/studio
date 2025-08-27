// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwbX9wZtlEmQjuFvkGe7iDofLGXWVvDaU",
  authDomain: "osama-2020.firebaseapp.com",
  databaseURL: "https://osama-2020-default-rtdb.firebaseio.com",
  projectId: "osama-2020",
  storageBucket: "osama-2020.appspot.com",
  messagingSenderId: "390287828886",
  appId: "1:390287828886:web:ce0523224f5de42c7cdfb7",
  measurementId: "G-SW1C8RELTP"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Analytics and export it
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, db, auth, analytics };
