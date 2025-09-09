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

// ... (Initialization and Global State are mostly unchanged) ...
// RE-ADD `markers` and add `communityMarkers`
let markers = [];
let communityMarkers = [];
const ZOOM_THRESHOLD = 14; // The zoom level to switch between dots and icons

// ... (Rest of Global State is unchanged) ...


// --- Main App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // ... (All element references are the same) ...

    // ... (Initial UI setup is the same) ...

    mapboxgl.accessToken = 'pk.eyJ1IjoicDFjcmVhdGlvbnMiLCJhIjoiY2p6ajZvejJmMDZhaTNkcWpiN294dm12eCJ9.8ckNT6kfuJry7K7GAeIuxw';
    map = new mapboxgl.Map({
        container: 'map',
        style: mapStyles[currentStyleIndex].url,
        center: [-87.6298, 41.8781],
        zoom: 10
    });

    map.on('load', () => {
        initializeMapLayers();
        // REMOVED: setupPinClickListeners() is no longer needed here
    });

    // NEW: Zoom listener to control marker visibility
    map.on('zoom', () => {
        const currentZoom = map.getZoom();
        const display = currentZoom >= ZOOM_THRESHOLD ? 'block' : 'none';
        markers.forEach(marker => marker.getElement().style.display = display);
        communityMarkers.forEach(marker => marker.getElement().style.display = display);
    });
    
    // ... (All event listeners are the same) ...
});


// ... (onAuthStateChanged is unchanged) ...

// --- Functions ---

// RE-ARCHITECTED: initializeMapLayers
function initializeMapLayers() {
    // ... (user-route and user-location-point layers are the same) ...

    // User Photo Pins Source (ONLY for dots)
    if (!map.getSource('user-pins-source')) {
        map.addSource('user-pins-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    }
    if (!map.getLayer('user-pins-dots')) {
        map.addLayer({ id: 'user-pins-dots', type: 'circle', source: 'user-pins-source', maxzoom: ZOOM_THRESHOLD, paint: { 'circle-radius': 6, 'circle-color': '#007bff', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } });
    }
    // REMOVED: The user-pins-icons symbol layer is gone.
    
    // Community Photo Pins Source (ONLY for dots)
    if (!map.getSource('community-pins-source')) {
        map.addSource('community-pins-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    }
    if (!map.getLayer('community-pins-dots')) {
        map.addLayer({ id: 'community-pins-dots', type: 'circle', source: 'community-pins-source', maxzoom: ZOOM_THRESHOLD, paint: { 'circle-radius': 6, 'circle-color': '#28a745', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } });
    }
    // REMOVED: The community-pins-icons symbol layer is gone.
}


// RE-ARCHITECTED: handlePhoto now creates HTML markers
async function handlePhoto(event) {
    // ... (logic to get file and compress) ...
    navigator.geolocation.getCurrentPosition(async (position) => {
        const coords = [position.coords.longitude, position.coords.latitude];
        if (!currentUser) {
            const reader = new FileReader();
            reader.readAsDataURL(processedFile);
            reader.onload = e => {
                const pinInfo = { id: `pin-${Date.now()}`, coords, image: e.target.result, title: 'New Photo' };
                photoPins.push(pinInfo);
                createPhotoMarker(pinInfo, 'user'); // Create HTML marker
                updateUserPinsSource(); // Update dots layer
            };
            // ... reset button state ...
            return;
        }
        try {
            // ... (upload logic) ...
            const pinInfo = { id: `pin-${timestamp}`, coords, imageURL: downloadURL, title: 'New Photo' };
            photoPins.push(pinInfo);
            createPhotoMarker(pinInfo, 'user'); // Create HTML marker
            updateUserPinsSource(); // Update dots layer
        } 
        // ... (catch/finally blocks) ...
    }, /* ... */);
}

// NEW: This function creates the HTML markers
function createPhotoMarker(pinInfo, type, routeInfo = {}) {
    const el = document.createElement('div');
    el.className = 'photo-marker';
    el.style.backgroundImage = `url(${pinInfo.imageURL || pinInfo.image})`;

    let popupHTML;
    if (type === 'user') {
        popupHTML = createPhotoPopupHTML(pinInfo);
    } else { // community
        el.style.borderColor = '#28a745'; // Green border for community pins
        popupHTML = `<div><img src="${pinInfo.imageURL}" alt="Community photo" style="width:100%; border-radius: 4px;"/><p style="margin: 5px 0 0;"><strong>${pinInfo.title}</strong></p><small>By: <a href="#" class="profile-link" data-userid="${routeInfo.userId}">${routeInfo.username || 'A user'}</a></small></div>`;
    }

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);

    const marker = new mapboxgl.Marker(el)
        .setLngLat(pinInfo.coords)
        .setPopup(popup)
        .addTo(map);

    // Set initial visibility based on zoom
    marker.getElement().style.display = map.getZoom() >= ZOOM_THRESHOLD ? 'block' : 'none';

    if (type === 'user') {
        markers.push(marker);
        // Add listeners for edit/delete after popup opens
        popup.on('open', () => {
            document.getElementById(`save-${pinInfo.id}`)?.addEventListener('click', () => { /* ... save logic ... */ });
            document.getElementById(`delete-${pinInfo.id}`)?.addEventListener('click', () => {
                if (confirm("Are you sure?")) {
                    photoPins = photoPins.filter(p => p.id !== pinInfo.id);
                    marker.remove();
                    updateUserPinsSource();
                }
            });
        });
    } else {
        communityMarkers.push(marker);
        // Add listener for profile link after popup opens
        popup.on('open', () => {
            document.querySelector(`.profile-link[data-userid="${routeInfo.userId}"]`)?.addEventListener('click', (e) => {
                e.preventDefault();
                showPublicProfile(routeInfo.userId);
            });
        });
    }
}

// RE-ARCHITECTED: fetchAndDisplayCommunityRoutes now creates HTML markers
async function fetchAndDisplayCommunityRoutes() {
    try {
        const q = query(collection(db, "publishedRoutes"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        clearCommunityRoutes();
        let allCommunityPinFeatures = [];

        querySnapshot.forEach(doc => {
            const routeData = doc.data();
            // ... (draw route line logic is the same) ...

            const mapboxPins = convertPinsFromFirestore(routeData.pins);
            if (mapboxPins) {
                mapboxPins.forEach(pin => {
                    // Create the HTML marker for the zoomed-in view
                    createPhotoMarker(pin, 'community', { userId: routeData.userId, username: routeData.username });
                    // Add the data for the zoomed-out dots view
                    allCommunityPinFeatures.push({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: pin.coords },
                        properties: {} // No data needed here, just the point
                    });
                });
            }
        });
        if (map.getSource('community-pins-source')) {
            map.getSource('community-pins-source').setData({ type: 'FeatureCollection', features: allCommunityPinFeatures });
        }
    } catch (error) { console.error("Error fetching routes:", error); }
}

// RE-ARCHITECTED: Clear functions now handle HTML markers too
function clearCommunityRoutes() {
    communityMarkers.forEach(marker => marker.remove());
    communityMarkers = [];
    communityLayers.forEach(layer => {
        if (map.getLayer(layer.id)) map.removeLayer(layer.id);
        if (map.getSource(layer.id)) map.removeSource(layer.id);
    });
    if (map.getSource('community-pins-source')) map.getSource('community-pins-source').setData({ type: 'FeatureCollection', features: [] });
    communityLayers = [];
}

function clearCurrentSession() {
    markers.forEach(marker => marker.remove());
    markers = [];
    photoPins = [];
    routeCoordinates = [];
    updateUserPinsSource();
    if (map && map.getSource('user-route')) map.getSource('user-route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
}

function displaySessionData(data) {
    photoPins = data.pins || [];
    routeCoordinates = data.route || [];
    photoPins.forEach(pin => createPhotoMarker(pin, 'user')); // Recreate markers
    updateUserPinsSource(); // Update dots
    if (map.getSource('user-route')) map.getSource('user-route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } });
}


// ... (The rest of your js/mapscript.js file is correct and unchanged) ...