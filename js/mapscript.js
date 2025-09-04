// --- Firebase SDK Setup ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- Garbage Path V2 Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyCE1b6VtJjUs0O5YvyLjeslxuHC8UlgJUM",
  authDomain: "garbagepathv2.firebaseapp.com",
  projectId: "garbagepathv2",
  storageBucket: "garbagepathv2.firebasestorage.app",
  messagingSenderId: "505856089619",
  appId: "1:505856089619:web:682f58d02be4295be4a9e6",
  measurementId: "G-SM46WXV0CN"
};

// ... (Firebase initialization and Global State are unchanged) ...
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
const storage = getStorage();
console.log("Firebase Initialized!");

let currentUser = null;
let trackingWatcher = null;
let routeCoordinates = [];
let photoPins = [];
let markers = [];
let map;
let findMeMarker = null;
let isCommunityViewOn = false;
let communityLayers = [];


// --- Main App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // ... (Element references and most event listeners are unchanged) ...
    const termsModal = document.getElementById('termsModal');
    const authModal = document.getElementById('authModal');
    // ... (and so on for all your elements)
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const publishBtn = document.getElementById('publishBtn');

    // ... (Mapbox setup and other listeners)
    
    saveBtn.addEventListener('click', saveSession);
    loadBtn.addEventListener('click', loadSession);
    publishBtn.addEventListener('click', publishRoute);
});


// ... (Auth state listener and UI functions are unchanged) ...


// --- Community Feature Functions (MODIFIED) ---

async function fetchAndDisplayCommunityRoutes() {
    try {
        const querySnapshot = await getDocs(collection(db, "publishedRoutes"));
        querySnapshot.forEach(doc => {
            const routeData = doc.data();
            const routeId = doc.id;

            // FIX: Transform coordinate data back from objects to nested arrays
            const originalCoords = routeData.routeCoordinates.map(coord => [coord.lng, coord.lat]);

            map.addSource(`community-route-${routeId}`, {
                type: 'geojson',
                data: { type: 'Feature', geometry: { type: 'LineString', coordinates: originalCoords } }
            });
            map.addLayer({
                id: `community-route-${routeId}`,
                type: 'line',
                source: `community-route-${routeId}`,
                paint: { 'line-color': '#28a745', 'line-width': 4, 'line-opacity': 0.7 }
            });
            communityLayers.push({ id: `community-route-${routeId}`, type: 'layer' });
            
            // ... (rest of the function for adding photo pins is unchanged)
        });
    } catch (error) {
        console.error("Error fetching community routes:", error);
        alert("Could not load community data.");
    }
}


async function publishRoute() {
    if (!currentUser) return;
    if (routeCoordinates.length < 2 || photoPins.length === 0) {
        alert("You need a tracked route and at least one photo pin to publish.");
        return;
    }

    // FIX: Transform the nested array into an array of objects
    const transformedCoords = routeCoordinates.map(coord => ({
        lng: coord[0],
        lat: coord[1]
    }));

    const dataModal = document.getElementById('dataModal');
    try {
        await addDoc(collection(db, "publishedRoutes"), {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            timestamp: new Date(),
            routeCoordinates: transformedCoords, // Use the transformed data
            photoPins: photoPins
        });
        alert("Success! Your route has been published.");
        clearCurrentSession();
        dataModal.style.display = 'none';
    } catch (error) {
        console.error("Error publishing route:", error);
        alert("There was an error publishing your route.");
    }
}

// ... (The rest of your js/mapscript.js file is unchanged. All save/load functions are correct.)

