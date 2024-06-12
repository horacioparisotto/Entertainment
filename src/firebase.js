import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyAQyqGt18KnOptBX0EdHkfC3OPuESvCWX8",
  authDomain: "netflix-clone-c7c48.firebaseapp.com",
  projectId: "netflix-clone-c7c48",
  storageBucket: "netflix-clone-c7c48.appspot.com",
  messagingSenderId: "1052265177477",
  appId: "1:1052265177477:web:e874c67925b9c836a364ec",
  measurementId: "G-HXVGWNBCTL",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();

export { auth };
export default db;
