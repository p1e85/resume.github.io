// --- Firebase SDK Setup ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- Litter Bugs V2 Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyCE1b6VtJjUs0O5YvyLjeslxuHC8UlgJUM",
  authDomain: "garbagepathv2.firebaseapp.com",
  projectId: "garbagepathv2",
  storageBucket: "garbagepathv2.firebasestorage.app",
  messagingSenderId: "505856089619",
  appId: "1:505856089619:web:682f58d02be4295be4a9e6",
  measurementId: "G-SM46WXV0CN"
};

// ... (Initialization and Global State are unchanged) ...

// --- Main App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // ... (All element references and event listeners are unchanged) ...
});

// ... (onAuthStateChanged is unchanged) ...

// --- Functions ---

// --- MODIFIED: Data Conversion Helpers ---
function convertRouteForFirestore(coordsArray) {
    if (!coordsArray) return [];
    return coordsArray.map(coord => ({ lng: coord[0], lat: coord[1] }));
}

function convertRouteFromFirestore(coordsData) {
    if (!coordsData || coordsData.length === 0) return [];
    // Backwards compatibility check: if the first item is an array, it's the old format.
    if (Array.isArray(coordsData[0])) {
        return coordsData; // Return as-is
    }
    // Otherwise, convert from the new object format.
    return coordsData.map(coord => [coord.lng, coord.lat]);
}

function convertPinsForFirestore(pinsArray) {
    if (!pinsArray) return [];
    return pinsArray.map(pin => {
        const newPin = { ...pin };
        if (Array.isArray(newPin.coords)) {
            newPin.coords = { lng: newPin.coords[0], lat: newPin.coords[1] };
        }
        return newPin;
    });
}

function convertPinsFromFirestore(pinsData) {
    if (!pinsData || pinsData.length === 0) return [];
    return pinsData.map(pin => {
        const newPin = { ...pin };
        // Backwards compatibility check: if coords is an object, convert it.
        if (newPin.coords && typeof newPin.coords === 'object' && !Array.isArray(newPin.coords)) {
            newPin.coords = [newPin.coords.lng, newPin.coords.lat];
        }
        return newPin;
    });
}


// ... (The rest of your js/mapscript.js file is unchanged) ...