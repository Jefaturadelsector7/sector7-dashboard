import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDsv__FkiyJzZVT97-u7dxMRCISuHeXpE",
  authDomain: "sector-7-primarias.firebaseapp.com",
  projectId: "sector-7-primarias",
  storageBucket: "sector-7-primarias.firebasestorage.app",
  messagingSenderId: "347316682486",
  appId: "1:347316682486:web:5af702bcaedb9f096db6d7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);