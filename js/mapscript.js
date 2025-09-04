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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
const storage = getStorage();
console.log("Firebase Initialized!");

// --- Global State ---
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

    // --- Element References ---
    const termsModal = document.getElementById('termsModal');
    const authModal = document.getElementById('authModal');
    const agreeBtn = document.getElementById('agreeBtn');
    const termsCheckbox = document.getElementById('termsCheckbox');
    const signUpBtn = document.getElementById('signUpBtn');
    const loginBtn = document.getElementById('loginBtn');
    const skipBtn = document.getElementById('skipBtn');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const authError = document.getElementById('authError');
    const findMeBtn = document.getElementById('findMeBtn');
    const trackBtn = document.getElementById('trackBtn');
    const pictureBtn = document.getElementById('pictureBtn');
    const cameraInput = document.getElementById('cameraInput');
    const dataBtn = document.getElementById('dataBtn');
    const dataModal = document.getElementById('dataModal');
    const closeDataModalBtn = dataModal.querySelector('.close-btn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const exportBtn = document.getElementById('exportBtn');
    const communityBtn = document.getElementById('communityBtn');
    const publishBtn = document.getElementById('publishBtn');
    const loginSignupBtn = document.getElementById('loginSignupBtn');
    const sessionsModal = document.getElementById('sessionsModal');
    const sessionsModalCloseBtn = sessionsModal.querySelector('.close-btn');
    const localSessionsModal = document.getElementById('localSessionsModal');
    const localSessionsModalCloseBtn = localSessionsModal.querySelector('.close-btn');
    const userStatus = document.getElementById('userStatus');
    const loggedInContent = document.getElementById('loggedInContent');
    const guestContent = document.getElementById('guestContent');
    const userEmail = document.getElementById('userEmail');

    // --- Initial UI Setup ---
    if (sessionStorage.getItem('termsAccepted')) {
        termsModal.style.display = 'none';
        userStatus.style.display = 'flex';
    } else {
        termsModal.style.display = 'flex';
    }

    // --- Mapbox Setup ---
    mapboxgl.accessToken = 'pk.eyJ1IjoicDFjcmVhdGlvbnMiLCJhIjoiY2p6ajZvejJmMDZhaTNkcWpiN294dm12eCJ9.8ckNT6kfuJry7K7GAeIuxw';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-87.6298, 41.8781],
        zoom: 10
    });

    map.on('load', () => {
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

    // --- Firebase Auth State Listener (MOVED INSIDE) ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            userEmail.textContent = `Logged in as: ${user.email}`;
            loggedInContent.style.display = 'flex';
            guestContent.style.display = 'none';
            authModal.style.display = 'none';
            publishBtn.style.display = 'block';
        } else {
            currentUser = null;
            loggedInContent.style.display = 'none';
            guestContent.style.display = 'block';
            publishBtn.style.display = 'none';
        }
    });

    // --- Event Listeners ---
    termsCheckbox.addEventListener('change', () => {
        agreeBtn.disabled = !termsCheckbox.checked;
    });

    agreeBtn.addEventListener('click', () => {
        termsModal.style.display = 'none';
        sessionStorage.setItem('termsAccepted', 'true');
        userStatus.style.display = 'flex';
        if (!currentUser) {
            authModal.style.display = 'flex';
        }
    });
    
    loginSignupBtn.addEventListener('click', () => {
        authModal.style.display = 'flex';
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

    document.getElementById('logoutBtn').addEventListener('click', async () => {
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
    closeDataModalBtn.addEventListener('click', () => dataModal.style.display = 'none');
    
    sessionsModalCloseBtn.addEventListener('click', () => sessionsModal.style.display = 'none');
    localSessionsModalCloseBtn.addEventListener('click', () => localSessionsModal.style.display = 'none');

    window.addEventListener('click', (event) => {
        if (event.target == dataModal || event.target == sessionsModal || event.target == localSessionsModal) {
            dataModal.style.display = 'none';
            sessionsModal.style.display = 'none';
            localSessionsModal.style.display = 'none';
        }
    });

    saveBtn.addEventListener('click', saveSession);
    loadBtn.addEventListener('click', loadSession);
    exportBtn.addEventListener('click', exportGeoJSON);
    communityBtn.addEventListener('click', toggleCommunityView);
    publishBtn.addEventListener('click', publishRoute);
});

// --- Functions ---
function findMe() {
    if (findMeMarker) findMeMarker.remove();
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        findMeMarker = new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);
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
    const file = event.target.files[0];
    if (!file) return;

    const pictureBtn = document.getElementById('pictureBtn');
    const originalButtonText = pictureBtn.innerHTML;
    pictureBtn.innerHTML = 'Processing...';
    pictureBtn.disabled = true;

    if (!currentUser) { // Guest Mode
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            navigator.geolocation.getCurrentPosition(position => {
                const pinInfo = {
                    id: `pin-${Date.now()}`,
                    coords: [position.coords.longitude, position.coords.latitude],
                    image: e.target.result,
                    title: 'New Photo'
                };
                photoPins.push(pinInfo);
                addPhotoMarker(pinInfo);
            }, () => alert("Could not get location."));
        };
        pictureBtn.innerHTML = originalButtonText;
        pictureBtn.disabled = false;
        event.target.value = '';
        return;
    }
    
    try { // Logged-in User
        const timestamp = Date.now();
        const storageRef = ref(storage, `photos/${currentUser.uid}/${timestamp}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        navigator.geolocation.getCurrentPosition(position => {
            const pinInfo = {
                id: `pin-${timestamp}`,
                coords: [position.coords.longitude, position.coords.latitude],
                imageURL: downloadURL,
                title: 'New Photo'
            };
            photoPins.push(pinInfo);
            addPhotoMarker(pinInfo);
        }, () => alert("Could not get location."));
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
    el.style.backgroundImage = `url(${pinInfo.imageURL || pinInfo.image})`;
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(createPhotoPopupHTML(pinInfo));
    const marker = new mapboxgl.Marker(el).setLngLat(pinInfo.coords).setPopup(popup).addTo(map);
    markers.push(marker);
    popup.on('open', () => {
        document.getElementById(`save-${pinInfo.id}`).addEventListener('click', () => {
            const pin = photoPins.find(p => p.id === pinInfo.id);
            if (pin) pin.title = document.getElementById(`title-${pinInfo.id}`).value;
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
    return `<div><img src="${pinInfo.imageURL || pinInfo.image}" alt="User photo" style="width:100%; height:auto; border-radius: 4px;"/><input type="text" id="title-${pinInfo.id}" value="${pinInfo.title}" placeholder="Enter a title" style="width: 95%; margin-top: 10px;"><div style="display: flex; justify-content: space-between; margin-top: 5px;"><button id="save-${pinInfo.id}">Save Title</button><button id="delete-${pinInfo.id}" style="background-color: #dc3545;">Delete</button></div></div>`;
}

// --- Community Functions ---
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
            const originalCoords = routeData.routeCoordinates.map(coord => [coord.lng, coord.lat]);
            map.addSource(`community-route-${routeId}`, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: originalCoords } } });
            map.addLayer({ id: `community-route-${routeId}`, type: 'line', source: `community-route-${routeId}`, paint: { 'line-color': '#28a745', 'line-width': 4, 'line-opacity': 0.7 } });
            communityLayers.push({ id: `community-route-${routeId}`, type: 'layer' });
            if (routeData.photoPins) {
                routeData.photoPins.forEach(pin => {
                    const el = document.createElement('div');
                    el.className = 'photo-marker';
                    el.style.backgroundImage = `url(${pin.imageURL})`;
                    el.style.borderColor = '#28a745';
                    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`<div><img src="${pin.imageURL}" alt="Community photo" style="width:100%; border-radius: 4px;"/><p style="margin: 5px 0 0;"><strong>${pin.title}</strong></p><small>By: ${routeData.userEmail || 'A user'}</small></div>`);
                    const marker = new mapboxgl.Marker(el).setLngLat(pin.coords).setPopup(popup).addTo(map);
                    communityLayers.push({ id: `community-marker-${pin.id}`, type: 'marker', instance: marker });
                });
            }
        });
    } catch (error) {
        console.error("Error fetching community routes:", error);
        alert("Could not load community data.");
    }
}

function clearCommunityRoutes() {
    communityLayers.forEach(layer => {
        if (layer.type === 'marker') layer.instance.remove();
        else if (layer.type === 'layer') {
            if (map.getLayer(layer.id)) map.removeLayer(layer.id);
            if (map.getSource(layer.id)) map.removeSource(layer.id);
        }
    });
    communityLayers = [];
}

async function publishRoute() {
    if (!currentUser) return;
    if (routeCoordinates.length < 2 || photoPins.length === 0) {
        alert("You need a tracked route and at least one photo pin to publish.");
        return;
    }
    const transformedCoords = routeCoordinates.map(coord => ({ lng: coord[0], lat: coord[1] }));
    try {
        await addDoc(collection(db, "publishedRoutes"), { userId: currentUser.uid, userEmail: currentUser.email, timestamp: new Date(), routeCoordinates: transformedCoords, photoPins: photoPins });
        alert("Success! Your route has been published.");
        clearCurrentSession();
        document.getElementById('dataModal').style.display = 'none';
    } catch (error) {
        console.error("Error publishing route:", error);
        alert("There was an error publishing your route.");
    }
}

// --- Data Management Functions ---
async function saveSession() {
    const dataModal = document.getElementById('dataModal');
    if (!currentUser) { // Guest Logic
        const sessionName = prompt("Name this local session:", `Cleanup on ${new Date().toLocaleDateString()}`);
        if (sessionName) {
            const guestSessions = JSON.parse(localStorage.getItem('guestSessions')) || [];
            guestSessions.push({ sessionName, timestamp: new Date().toISOString(), pins: photoPins, route: routeCoordinates });
            localStorage.setItem('guestSessions', JSON.stringify(guestSessions));
            alert(`Session "${sessionName}" saved locally.`);
            dataModal.style.display = 'none';
        }
        return;
    }
    // Logged-in User Logic
    const sessionName = prompt("Name this cloud session:", `Cleanup on ${new Date().toLocaleDateString()}`);
    if (sessionName) {
        try {
            const transformedCoords = routeCoordinates.map(coord => ({ lng: coord[0], lat: coord[1] }));
            await addDoc(collection(db, "users", currentUser.uid, "privateSessions"), { sessionName, timestamp: new Date(), pins: photoPins, route: transformedCoords });
            alert(`Session "${sessionName}" saved to your account!`);
            dataModal.style.display = 'none';
        } catch (error) {
            console.error("Error saving session to Firestore:", error);
            alert("Could not save session to your account.");
        }
    }
}

async function loadSession() {
    if (!currentUser) { // Guest Logic
        populateLocalSessionList();
        document.getElementById('localSessionsModal').style.display = 'flex';
        return;
    }
    // Logged-in User Logic
    await populateSessionList();
    document.getElementById('sessionsModal').style.display = 'flex';
}

function populateLocalSessionList() {
    const localSessionList = document.getElementById('localSessionList');
    const guestSessions = JSON.parse(localStorage.getItem('guestSessions')) || [];
    localSessionList.innerHTML = '';
    if (guestSessions.length === 0) {
        localSessionList.innerHTML = '<li>No locally saved sessions found.</li>';
        return;
    }
    guestSessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach((sessionData, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${sessionData.sessionName}</span><span class="session-date">${new Date(sessionData.timestamp).toLocaleDateString()}</span>`;
        li.addEventListener('click', () => loadSpecificLocalSession(index));
        localSessionList.appendChild(li);
    });
}

function loadSpecificLocalSession(sessionIndex) {
    const guestSessions = JSON.parse(localStorage.getItem('guestSessions')) || [];
    const sessionData = guestSessions[sessionIndex];
    if (sessionData) {
        clearCurrentSession();
        displaySessionData(sessionData);
        alert(`Local session "${sessionData.sessionName}" loaded!`);
        document.getElementById('localSessionsModal').style.display = 'none';
    }
}

async function populateSessionList() {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '<li>Loading...</li>';
    try {
        const q = query(collection(db, "users", currentUser.uid, "privateSessions"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        sessionList.innerHTML = '';
        if (querySnapshot.empty) {
            sessionList.innerHTML = '<li>No saved cloud sessions found.</li>';
            return;
        }
        querySnapshot.forEach(doc => {
            const sessionData = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `<span>${sessionData.sessionName}</span><span class="session-date">${new Date(sessionData.timestamp.seconds * 1000).toLocaleDateString()}</span>`;
            li.addEventListener('click', () => loadSpecificSession(doc.id));
            sessionList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        sessionList.innerHTML = '<li>Could not load sessions.</li>';
    }
}

async function loadSpecificSession(sessionId) {
    try {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid, "privateSessions", sessionId));
        if (docSnap.exists()) {
            clearCurrentSession();
            const sessionData = docSnap.data();
            displaySessionData(sessionData);
            alert(`Session "${sessionData.sessionName}" loaded!`);
            document.getElementById('sessionsModal').style.display = 'none';
        }
    } catch (error) {
        console.error("Error loading specific session:", error);
        alert("Failed to load the session.");
    }
}

function clearCurrentSession() {
    markers.forEach(marker => marker.remove());
    markers = [];
    photoPins = [];
    routeCoordinates = [];
    if(map.getSource('user-route')) map.getSource('user-route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
}

function displaySessionData(data) {
    // FIX for loading data from Firestore
    if (data.route && typeof data.route[0].lat !== 'undefined') {
        routeCoordinates = data.route.map(coord => [coord.lng, coord.lat]);
    } else {
        routeCoordinates = data.route || [];
    }
    photoPins = data.pins || [];
    
    photoPins.forEach(pin => addPhotoMarker(pin));
    if(map.getSource('user-route')) map.getSource('user-route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } });
}

function exportGeoJSON() {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    const fileName = `garbage_path_data_${timestamp}.geojson`;
    const pinFeatures = photoPins.map(pin => ({ type: 'Feature', geometry: { type: 'Point', coordinates: pin.coords }, properties: { title: pin.title, image_url: pin.imageURL || 'local_data' } }));
    const routeFeature = { type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates }, properties: {} };
    const geojson = { type: 'FeatureCollection', features: [...pinFeatures, routeFeature] };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    document.getElementById('dataModal').style.display = 'none';
}

