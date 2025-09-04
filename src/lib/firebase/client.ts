
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0fSUx51wV1NHBmGfnR5PLZHU4PSWrwDU",
  authDomain: "daily-sales-tracker-cr1db.firebaseapp.com",
  projectId: "daily-sales-tracker-cr1db",
  storageBucket: "daily-sales-tracker-cr1db.appspot.com",
  messagingSenderId: "470454086647",
  appId: "1:470454086647:web:ba1b12afee44694b4c9cf2"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Sync auth token with a cookie for server-side access
onIdTokenChanged(auth, async (user) => {
    if (user) {
        const token = await user.getIdToken();
        document.cookie = `firebase-auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    } else {
        document.cookie = 'firebase-auth-token=; path=/; max-age=-1;';
    }
});


// Initialize Analytics and export it
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, db, auth, storage, analytics };
