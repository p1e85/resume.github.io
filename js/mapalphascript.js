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
    // ... (All element references are the same) ...

    if (sessionStorage.getItem('termsAccepted')) {
        document.getElementById('termsModal').style.display = 'none';
        document.getElementById('userStatus').style.display = 'flex';
    } else {
        document.getElementById('termsModal').style.display = 'flex';
    }

    mapboxgl.accessToken = 'pk.eyJ1IjoicDFjcmVhdGlvbnMiLCJhIjoiY2p6ajZvejJmMDZhaTNkcWpiN294dm12eCJ9.8ckNT6kfuJry7K7GAeIuxw';
    map = new mapboxgl.Map({
        container: 'map',
        style: mapStyles[currentStyleIndex].url,
        center: [-87.6298, 41.8781],
        zoom: 10
    });

    map.on('load', () => {
        initializeMapLayers();
        setupPinClickListeners();
    });

    // ... (All event listeners are the same) ...
});

// ... (onAuthStateChanged is unchanged) ...

// --- Functions ---

// CORRECTED: initializeMapLayers function
function initializeMapLayers() {
    // User Route Line
    if (!map.getSource('user-route')) {
        map.addSource('user-route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } } });
    }
    if (!map.getLayer('user-route')) {
        map.addLayer({ id: 'user-route', type: 'line', source: 'user-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#007bff', 'line-width': 5 } });
    }

    // User Location Point
    if (!map.getSource('user-location-point')) {
        map.addSource('user-location-point', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', 'coordinates': [] } } });
    }
    if (!map.getLayer('user-location-pulse')) {
        map.addLayer({ id: 'user-location-pulse', type: 'circle', source: 'user-location-point', paint: { 'circle-radius': 15, 'circle-color': '#007bff', 'circle-opacity': 0.2 } });
    }
    if (!map.getLayer('user-location-dot')) {
        map.addLayer({ id: 'user-location-dot', type: 'circle', source: 'user-location-point', paint: { 'circle-radius': 6, 'circle-color': '#fff', 'circle-stroke-width': 2, 'circle-stroke-color': '#007bff' } });
    }

    // User Photo Pins Source and Layers
    if (!map.getSource('user-pins-source')) {
        map.addSource('user-pins-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    }
    if (!map.getLayer('user-pins-dots')) {
        map.addLayer({ id: 'user-pins-dots', type: 'circle', source: 'user-pins-source', maxzoom: 14, paint: { 'circle-radius': 6, 'circle-color': '#007bff', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } });
    }
    if (!map.getLayer('user-pins-icons')) {
        map.addLayer({ 
            id: 'user-pins-icons', 
            type: 'symbol', 
            source: 'user-pins-source', 
            minzoom: 14, 
            layout: { 
                'icon-image': 'camera-15', // Standard Mapbox Maki icon
                'icon-size': 1.5, 
                'icon-allow-overlap': true 
            }
            // NO 'paint' property is needed here for this type of icon
        });
    }
    
    // Community Photo Pins Source and Layers
    if (!map.getSource('community-pins-source')) {
        map.addSource('community-pins-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    }
    if (!map.getLayer('community-pins-dots')) {
        map.addLayer({ id: 'community-pins-dots', type: 'circle', source: 'community-pins-source', maxzoom: 14, paint: { 'circle-radius': 6, 'circle-color': '#28a745', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } });
    }
    if (!map.getLayer('community-pins-icons')) {
        map.addLayer({ 
            id: 'community-pins-icons', 
            type: 'symbol', 
            source: 'community-pins-source', 
            minzoom: 14, 
            layout: { 
                'icon-image': 'marker-15', // Use a different standard icon for distinction
                'icon-size': 1.5, 
                'icon-allow-overlap': true 
            }
            // NO 'paint' property is needed here either
        });
    }
}


// ... (The rest of your js/mapscript.js file is correct and unchanged) ...