// --- Firebase SDK Setup ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxyFBT_Is-jY2n39Bp-1fW8Nn3PxaSfsc",
  authDomain: "garbage-path.firebaseapp.com",
  projectId: "garbage-path",
  storageBucket: "garbage-path.firebasestorage.app",
  messagingSenderId: "885911396160",
  appId: "1:885911396160:web:c37e5128f9c7a3a1be64a5",
  measurementId: "G-G0SEDXVZ3V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
console.log("Firebase Initialized!");

// --- Global State ---
let currentUser = null;
let trackingWatcher = null;
let routeCoordinates = [];
let photoPins = [];
let markers = [];
let map; 
let findMeMarker = null; // NEW: To hold the "Find Me" marker

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
    });

    map.on('load', () => {
        map.addSource('route', {
            'type': 'geojson',
            'data': { 'type': 'Feature', 'geometry': { 'type': 'LineString', 'coordinates': [] } }
        });
        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': { 'line-join': 'round', 'line-cap': 'round' },
            'paint': { 'line-color': '#0000ff', 'line-width': 5 }
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
});

// --- Firebase Auth State Listener ---
onAuthStateChanged(auth, (user) => {
    const userStatus = document.getElementById('userStatus'); 
    const userEmail = document.getElementById('userEmail');
    const authModal = document.getElementById('authModal');

    if (user) {
        currentUser = user;
        if(userEmail) userEmail.textContent = `Logged in as: ${user.email}`;
        if(userStatus) userStatus.style.display = 'flex';
        if(authModal) authModal.style.display = 'none';
    } else {
        currentUser = null;
        if(userStatus) userStatus.style.display = 'none';
        if(userEmail) userEmail.textContent = '';
        if (authModal && sessionStorage.getItem('termsAccepted')) {
            authModal.style.display = 'flex';
        }
    }
});


// --- Functions ---

function findMe() {
    // UPDATED: Remove the previous marker if it exists
    if (findMeMarker) {
        findMeMarker.remove();
    }

    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        
        // UPDATED: Create the new marker and store it in our variable
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
            if (map.getSource('route')) {
                map.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } });
            }
            map.flyTo({ center: newCoord, zoom: 16 });
        }, () => alert("Error watching position."), { enableHighAccuracy: true });
        trackBtn.textContent = '🛑 Stop Tracking';
        trackBtn.classList.add('tracking');
    }
}

function handlePhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = e => {
        const imageDataUrl = e.target.result;
        navigator.geolocation.getCurrentPosition(position => {
            const coords = [position.coords.longitude, position.coords.latitude];
            const pinInfo = {
                id: `pin-${Date.now()}`,
                coords: coords,
                image: imageDataUrl,
                title: 'New Photo'
            };
            photoPins.push(pinInfo);
            addPhotoMarker(pinInfo);
        }, () => alert("Could not get location for the picture."), { enableHighAccuracy: true });
    };
    event.target.value = '';
}

function addPhotoMarker(pinInfo) {
    const el = document.createElement('div');
    el.className = 'photo-marker';
    el.style.backgroundImage = `url(${pinInfo.image})`;

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
            <img src="${pinInfo.image}" alt="User photo" style="width:100%; height:auto; border-radius: 4px;"/>
            <input type="text" id="title-${pinInfo.id}" value="${pinInfo.title}" placeholder="Enter a title" style="width: 95%; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                <button id="save-${pinInfo.id}">Save Title</button>
                <button id="delete-${pinInfo.id}" style="background-color: #dc3545;">Delete</button>
            </div>
        </div>
    `;
}

async function saveSession() {
    const dataModal = document.getElementById('dataModal');
    if (currentUser) {
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const sessionData = { pins: photoPins, route: routeCoordinates };
            await setDoc(userDocRef, { savedSession: sessionData });
            alert("Session saved to your account!");
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
                alert("Session loaded from your account!");
            } else {
                alert("No saved session found in your account.");
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
    if(map.getSource('route')) {
        map.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } });
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
            'image_data_url_truncated': pin.image.substring(0, 50) + '...'
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