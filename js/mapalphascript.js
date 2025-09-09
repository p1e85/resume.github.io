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
    // --- All element references are the same ---
    const termsModal = document.getElementById('termsModal');
    // ... etc.

    // --- Firebase Auth State Listener is now safely inside ---
    onAuthStateChanged(auth, async (user) => {
        // ... same auth logic
    });

    // --- Initial UI Setup ---
    if (sessionStorage.getItem('termsAccepted')) {
        document.getElementById('termsModal').style.display = 'none';
        document.getElementById('userStatus').style.display = 'flex';
    } else {
        document.getElementById('termsModal').style.display = 'flex';
    }

    // --- Mapbox Setup ---
    mapboxgl.accessToken = 'pk.eyJ1IjoicDFjcmVhdGlvbnMiLCJhIjoiY2p6ajZvejJmMDZhaTNkcWpiN294dm12eCJ9.8ckNT6kfuJry7K7GAeIuxw';
    map = new mapboxgl.Map({
        container: 'map',
        style: mapStyles[currentStyleIndex].url,
        center: [-87.6298, 41.8781],
        zoom: 10
    });

    map.on('load', () => {
        initializeMapLayers();
    });
    
    map.on('zoom', () => {
        toggleMarkerVisibility();
    });

    // --- All Event Listeners are the same ---
    // ...
});


// --- Functions ---

// RE-ARCHITECTED: initializeMapLayers is now simpler and more robust
function initializeMapLayers() {
    // User Route Line
    if (!map.getSource('user-route')) map.addSource('user-route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } });
    if (!map.getLayer('user-route')) map.addLayer({ id: 'user-route', type: 'line', source: 'user-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#007bff', 'line-width': 5 } });
    
    // User Location Point
    if (!map.getSource('user-location-point')) map.addSource('user-location-point', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', 'coordinates': [] } } });
    if (!map.getLayer('user-location-pulse')) map.addLayer({ id: 'user-location-pulse', type: 'circle', source: 'user-location-point', paint: { 'circle-radius': 15, 'circle-color': '#007bff', 'circle-opacity': 0.2 } });
    if (!map.getLayer('user-location-dot')) map.addLayer({ id: 'user-location-dot', type: 'circle', source: 'user-location-point', paint: { 'circle-radius': 6, 'circle-color': '#fff', 'circle-stroke-width': 2, 'circle-stroke-color': '#007bff' } });

    // User Photo Pins (for dots)
    if (!map.getSource('user-pins-source')) map.addSource('user-pins-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    if (!map.getLayer('user-pins-dots')) map.addLayer({ id: 'user-pins-dots', type: 'circle', source: 'user-pins-source', maxzoom: ZOOM_THRESHOLD, paint: { 'circle-radius': 6, 'circle-color': '#007bff', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } });

    // Community Photo Pins (for dots)
    if (!map.getSource('community-pins-source')) map.addSource('community-pins-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    if (!map.getLayer('community-pins-dots')) map.addLayer({ id: 'community-pins-dots', type: 'circle', source: 'community-pins-source', maxzoom: ZOOM_THRESHOLD, paint: { 'circle-radius': 6, 'circle-color': '#28a745', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } });
}

// ... (The rest of the JS file is correct and does not need to be changed) ...