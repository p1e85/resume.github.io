// --- Firebase SDK Setup ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- PASTE YOUR NEW V2 FIREBASE CONFIG HERE ---
// Make sure this is the config from your V2 project that supports all free tiers
const firebaseConfig = {
  apiKey: "YOUR_V2_API_KEY",
  authDomain: "YOUR_V2_AUTH_DOMAIN",
  projectId: "YOUR_V2_PROJECT_ID",
  storageBucket: "YOUR_V2_STORAGE_BUCKET",
  messagingSenderId: "YOUR_V2_SENDER_ID",
  appId: "YOUR_V2_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
const storage = getStorage(); // Initialize Cloud Storage
console.log("Firebase Initialized!");

// --- Global State ---
let currentUser = null;
let trackingWatcher = null;
let routeCoordinates = [];
let photoPins = [];
let markers = []; // For the user's own session pins
let map;
let findMeMarker = null;
let isCommunityViewOn = false;
let communityLayers = []; // To track community layers/markers for removal

// --- Main App Initialization ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Element References ---
    const termsModal = document.getElementById('termsModal');
    const authModal = document.getElementById('authModal');
    const userStatus = document.getElementById('userStatus');
    const userEmail = document.getElementById('userEmail');
    const agreeBtn = document.getElementById('agreeBtn');
    const termsCheckbox = document.getElementById('termsCheckbox');
    const signUpBtn = document.getElementById('signUpBtn');
    const loginBtn = document.getElementById('loginBtn');
    const skipBtn = document.getElementById('skipBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const authError = document.getElementById('authError');
    const findMeBtn = document.getElementById('findMeBtn');
    const trackBtn = document.getElementById('trackBtn');
    const pictureBtn = document.getElementById('pictureBtn');
    const cameraInput = document.getElementById('cameraInput');
    const dataBtn = document.getElementById('dataBtn');
    const dataModal = document.getElementById('dataModal');
    const closeBtn = dataModal.querySelector('.close-btn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const exportBtn = document.getElementById('exportBtn');
    const communityBtn = document.getElementById('communityBtn');
    const publishBtn = document.getElementById('publishBtn');

    // --- Initial UI Setup ---
    if (sessionStorage.getItem('termsAccepted')) {
        termsModal.style.display = 'none';
    } else {
        termsModal.style.display = 'flex';
    }

    // --- Mapbox Setup ---
    mapboxgl.accessToken = 'pk.eyJ1IjoicDFjcmVhdGlvbnMiLCJhIjoiY2p6ajZvejJmMDZhaTNkcWpiN294dm12eCJ9.8ckNT6kfuJry7K7GAeIuxw';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-87.6298, 41.8781], // Chicago, IL
        zoom: 10
    });

    map.on('load', () => {
        // Source for the user's own tracked route
        map.addSource('user-route', {
            'type': 'geojson',
            'data': { 'type': 'Feature', 'geometry': { 'type': 'LineString', 'coordinates': [] } }
        });
        map.addLayer({
            'id': 'user-route',
            'type': 'line',
            'source': 'user-route',
            'layout': { 'line-join': 'round', 'line-cap': 'round' },
            'paint': { 'line-color': '#007bff', 'line-width': 5 }
        });
    });

    // --- Event Listeners ---
    termsCheckbox.addEventListener('change', () => {
        agreeBtn.disabled = !termsCheckbox.checked;
    });

    agreeBtn.addEventListener('click', () => {
        termsModal.style.display = 'none';
        sessionStorage.setItem('termsAccepted', 'true');
        if (!currentUser) {
            authModal.style.display = 'flex';
        }
    });

    signUpBtn.addEventListener('click', async () => {
        try {
            authError.textContent = '';
            await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        } catch (error) {
            authError.textContent = error.message;
        }
    });

    loginBtn.addEventListener('click', async () => {
        try {
            authError.textContent = '';
            await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        } catch (error) {
            authError.textContent = error.message;
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
    });

    skipBtn.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    findMeBtn.addEventListener('click', findMe);
    trackBtn.addEventListener('click', toggleTracking);
    pictureBtn.addEventListener('click', () => cameraInput.click());
    cameraInput.addEventListener('change', handlePhoto);

    dataBtn.addEventListener('click', () => dataModal.style.display = 'flex');
    closeBtn.addEventListener('click', () => dataModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target == dataModal) {
            dataModal.style.display = 'none';
        }
    });
    saveBtn.addEventListener('click', saveSession);
    loadBtn.addEventListener('click', loadSession);
    exportBtn.addEventListener('click', exportGeoJSON);
    communityBtn.addEventListener('click', toggleCommunityView);
    publishBtn.addEventListener('click', publishRoute);
});

// --- Firebase Auth State Listener ---
onAuthStateChanged(auth, (user) => {
    const userStatus = document.getElementById('userStatus');
    const userEmail = document.getElementById('userEmail');
    const authModal = document.getElementById('authModal');
    const publishBtn = document.getElementById('publishBtn');

    if (user) {
        currentUser = user;
        if(userEmail) userEmail.textContent = `Logged in as: ${user.email}`;
        if(userStatus) userStatus.style.display = 'flex';
        if(authModal) authModal.style.display = 'none';
        if(publishBtn) publishBtn.style.display = 'block';
    } else {
        currentUser = null;
        if(userStatus) userStatus.style.display = 'none';
        if(userEmail) userEmail.textContent = '';
        if (authModal && sessionStorage.getItem('termsAccepted')) {
            authModal.style.display = 'flex';
        }
        if(publishBtn) publishBtn.style.display = 'none';
    }
});


// --- Functions ---

function findMe() {
    if (findMeMarker) {
        findMeMarker.remove();
    }
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        findMeMarker = new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map);
        map.flyTo({ center: [longitude, latitude], zoom: 15 });
    }, () => alert("Could not get your location."), { enableHighAccuracy: true });
}

function toggleTracking() {
    const trackBtn = document.getElementById('trackBtn');
    if (trackingWatcher) {
        navigator.geolocation.clearWatch(trackingWatcher);
        trackingWatcher = null;
        trackBtn.textContent = '🛰️ Start Tracking';
        trackBtn.classList.remove('tracking');
    } else {
        routeCoordinates = [];
        trackingWatcher = navigator.geolocation.watchPosition(position => {
            const newCoord = [position.coords.longitude, position.coords.latitude];
            routeCoordinates.push(newCoord);
            if (map.getSource('user-route')) {
                map.getSource('user-route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } });
            }
            map.flyTo({ center: newCoord, zoom: 16 });
        }, () => alert("Error watching position."), { enableHighAccuracy: true });
        trackBtn.textContent = '🛑 Stop Tracking';
        trackBtn.classList.add('tracking');
    }
}

async function handlePhoto(event) {
    if (!currentUser) {
        alert("Please log in to pin photos.");
        return;
    }
    const file = event.target.files[0];
    if (!file) return;

    const pictureBtn = document.getElementById('pictureBtn');
    const originalButtonText = pictureBtn.innerHTML;
    pictureBtn.innerHTML = 'Uploading...';
    pictureBtn.disabled = true;

    try {
        const timestamp = Date.now();
        const storageRef = ref(storage, `photos/${currentUser.uid}/${timestamp}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        navigator.geolocation.getCurrentPosition(position => {
            const coords = [position.coords.longitude, position.coords.latitude];
            const pinInfo = {
                id: `pin-${timestamp}`,
                coords: coords,
                imageURL: downloadURL, // Store the URL, not the data
                title: 'New Photo'
            };
            photoPins.push(pinInfo);
            addPhotoMarker(pinInfo);
        }, () => alert("Could not get location."), { enableHighAccuracy: true });

    } catch (error) {
        console.error("Error uploading photo:", error);
        alert("Photo upload failed.");
    } finally {
        pictureBtn.innerHTML = originalButtonText;
        pictureBtn.disabled = false;
        event.target.value = '';
    }
}

function addPhotoMarker(pinInfo) {
    const el = document.createElement('div');
    el.className = 'photo-marker';
    // Use imageURL if it exists (from Firebase), otherwise use the local 'image' data
    el.style.backgroundImage = `url(${pinInfo.imageURL || pinInfo.image})`;

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(createPhotoPopupHTML(pinInfo));
    const marker = new mapboxgl.Marker(el).setLngLat(pinInfo.coords).setPopup(popup).addTo(map);
    markers.push(marker);

    popup.on('open', () => {
        document.getElementById(`save-${pinInfo.id}`).addEventListener('click', () => {
            const titleInput = document.getElementById(`title-${pinInfo.id}`);
            const pin = photoPins.find(p => p.id === pinInfo.id);
            if (pin) pin.title = titleInput.value;
            popup.remove();
            alert("Title updated! Remember to save your session.");
        });

        document.getElementById(`delete-${pinInfo.id}`).addEventListener('click', () => {
            if (confirm("Are you sure you want to delete this pin?")) {
                photoPins = photoPins.filter(p => p.id !== pinInfo.id);
                marker.remove();
                alert("Pin deleted! Remember to save your session.");
            }
        });
    });
}

function createPhotoPopupHTML(pinInfo) {
    return `
        <div>
            <img src="${pinInfo.imageURL || pinInfo.image}" alt="User photo" style="width:100%; height:auto; border-radius: 4px;"/>
            <input type="text" id="title-${pinInfo.id}" value="${pinInfo.title}" placeholder="Enter a title" style="width: 95%; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                <button id="save-${pinInfo.id}">Save Title</button>
                <button id="delete-${pinInfo.id}" style="background-color: #dc3545;">Delete</button>
            </div>
        </div>
    `;
}

// --- Community Feature Functions ---

async function toggleCommunityView() {
    const communityBtn = document.getElementById('communityBtn');
    isCommunityViewOn = !isCommunityViewOn;

    if (isCommunityViewOn) {
        communityBtn.textContent = '🌎 Community View: ON';
        communityBtn.classList.remove('off');
        await fetchAndDisplayCommunityRoutes();
    } else {
        communityBtn.textContent = '🌎 Community View: OFF';
        communityBtn.classList.add('off');
        clearCommunityRoutes();
    }
}

async function fetchAndDisplayCommunityRoutes() {
    try {
        const querySnapshot = await getDocs(collection(db, "publishedRoutes"));
        querySnapshot.forEach(doc => {
            const routeData = doc.data();
            const routeId = doc.id;

            map.addSource(`community-route-${routeId}`, {
                type: 'geojson',
                data: { type: 'Feature', geometry: { type: 'LineString', coordinates: routeData.routeCoordinates } }
            });
            map.addLayer({
                id: `community-route-${routeId}`,
                type: 'line',
                source: `community-route-${routeId}`,
                paint: { 'line-color': '#28a745', 'line-width': 4, 'line-opacity': 0.7 }
            });
            communityLayers.push({ id: `community-route-${routeId}`, type: 'layer' });

            routeData.photoPins.forEach(pin => {
                const el = document.createElement('div');
                el.className = 'photo-marker';
                el.style.backgroundImage = `url(${pin.imageURL})`;
                el.style.borderColor = '#28a745';

                const popup = new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                        <div>
                            <img src="${pin.imageURL}" alt="Community photo" style="width:100%; border-radius: 4px;"/>
                            <p style="margin: 5px 0 0;"><strong>${pin.title}</strong></p>
                            <small>By: ${routeData.userEmail || 'A user'}</small>
                        </div>
                    `);

                const marker = new mapboxgl.Marker(el)
                    .setLngLat(pin.coords)
                    .setPopup(popup)
                    .addTo(map);
                communityLayers.push({ id: `community-marker-${pin.id}`, type: 'marker', instance: marker });
            });
        });
    } catch (error) {
        console.error("Error fetching community routes:", error);
        alert("Could not load community data.");
    }
}

function clearCommunityRoutes() {
    communityLayers.forEach(layer => {
        if (layer.type === 'marker') {
            layer.instance.remove();
        } else if (layer.type === 'layer') {
            if (map.getLayer(layer.id)) map.removeLayer(layer.id);
            if (map.getSource(layer.id)) map.removeSource(layer.id);
        }
    });
    communityLayers = [];
}

async function publishRoute() {
    if (!currentUser) {
        alert("You must be logged in to publish a route.");
        return;
    }
    if (routeCoordinates.length < 2 || photoPins.length === 0) {
        alert("You need a tracked route and at least one photo pin to publish.");
        return;
    }

    const dataModal = document.getElementById('dataModal');
    try {
        await addDoc(collection(db, "publishedRoutes"), {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            timestamp: new Date(),
            routeCoordinates: routeCoordinates,
            photoPins: photoPins
        });
        alert("Success! Your route has been published to the community map.");
        
        // Clear the user's current session data after publishing
        routeCoordinates = [];
        photoPins = [];
        markers.forEach(m => m.remove());
        markers = [];
        if (map.getSource('user-route')) {
            map.getSource('user-route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
        }
        dataModal.style.display = 'none';

    } catch (error) {
        console.error("Error publishing route:", error);
        alert("There was an error publishing your route.");
    }
}

// --- Data Management (Private Sessions) ---

async function saveSession() {
    const dataModal = document.getElementById('dataModal');
    if (currentUser) {
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const sessionData = { pins: photoPins, route: routeCoordinates };
            await setDoc(userDocRef, { savedSession: sessionData });
            alert("Private session saved to your account!");
        } catch (error) {
            console.error("Error saving to Firestore:", error);
            alert("Could not save session to your account.");
        }
    } else {
        const sessionData = { pins: photoPins, route: routeCoordinates };
        localStorage.setItem('mapSessionData', JSON.stringify(sessionData));
        alert("Session saved locally to this browser.");
    }
    dataModal.style.display = 'none';
}

async function loadSession() {
    const dataModal = document.getElementById('dataModal');
    // Clear any existing map data before loading
    markers.forEach(marker => marker.remove());
    markers = [];
    photoPins = [];
    routeCoordinates = [];

    let savedData = null;
    if (currentUser) {
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists() && docSnap.data().savedSession) {
                savedData = docSnap.data().savedSession;
                alert("Private session loaded from your account!");
            } else {
                alert("No saved private session found in your account.");
            }
        } catch (error) {
            console.error("Error loading from Firestore:", error);
            alert("Could not load session from your account.");
        }
    } else {
        const localData = JSON.parse(localStorage.getItem('mapSessionData'));
        if (localData) {
            savedData = localData;
            alert("Local session loaded.");
        } else {
            alert("No local session found.");
        }
    }

    if (savedData) {
        photoPins = savedData.pins || [];
        routeCoordinates = savedData.route || [];
    }
    
    photoPins.forEach(pin => addPhotoMarker(pin));
    if(map.getSource('user-route')) {
        map.getSource('user-route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } });
    }
    dataModal.style.display = 'none';
}

function exportGeoJSON() {
    const dataModal = document.getElementById('dataModal');
    const pinFeatures = photoPins.map(pin => ({
        'type': 'Feature',
        'geometry': { 'type': 'Point', 'coordinates': pin.coords },
        'properties': {
            'title': pin.title,
            'image_url': pin.imageURL || 'local_data'
        }
    }));
    const routeFeature = {
        'type': 'Feature',
        'geometry': { 'type': 'LineString', 'coordinates': routeCoordinates },
        'properties': {}
    };
    const geojson = {
        'type': 'FeatureCollection',
        'features': [...pinFeatures, routeFeature]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "garbage_path_data.geojson");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    dataModal.style.display = 'none';
}