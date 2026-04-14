// js/firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyBilxp63CncuZoVDQ2KcOfHUd_Gr0TCn1A",
  authDomain: "flowboard-app-1af87.firebaseapp.com",
  projectId: "flowboard-app-1af87",
  storageBucket: "flowboard-app-1af87.firebasestorage.app",
  messagingSenderId: "393290978098",
  appId: "1:393290978098:web:96af1192bc026074cafd2b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export services we'll use
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();