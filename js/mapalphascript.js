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
let isSignUpMode = true;

const mapStyles = [
    { name: 'Streets', url: 'mapbox://styles/mapbox/streets-v12' },
    { name: 'Outdoors', url: 'mapbox://styles/mapbox/outdoors-v12' },
    { name: 'Light', url: 'mapbox://styles/mapbox/light-v11' },
    { name: 'Dark', url: 'mapbox://styles/mapbox/dark-v11' },
    { name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-streets-v12' }
];
let currentStyleIndex = 0;

const allBadges = {
    first_find: { name: 'First Find', icon: '🗑️', description: 'Pinned your very first piece of litter.' },
    collector: { name: 'Collector', icon: '🛍️', description: 'Pinned a total of 50 items.' },
    super_collector: { name: 'Super Collector', icon: '🏆', description: 'Pinned a total of 250 items.' },
    eagle_eye: { name: 'Eagle Eye', icon: '🦅', description: 'Pinned 1000 items. A true garbage spotter!' },
    first_steps: { name: 'First Steps', icon: '👟', description: 'Completed your first route over 1km.' },
    explorer: { name: 'Explorer', icon: '🗺️', description: 'Walked a total of 25 kilometers.' },
    trailblazer: { name: 'Trailblazer', icon: '⛰️', description: 'Walked a total of 100 kilometers.' },
    marathoner: { name: 'Marathoner', icon: '🏃', description: 'Walked over 42.2km in a single session.' },
    initiate: { name: 'Initiate', icon: '🌱', description: 'Published your first route to the community.' },
    activist: { name: 'Activist', icon: '🌍', description: 'Published 10 routes to the community.' },
    guardian: { name: 'Guardian', icon: '🛡️', description: 'Published 50 routes to the community.' },
    community_pillar: { name: 'Community Pillar', icon: '🏛️', description: 'Published 100 routes. You are a legend!' }
};


// --- Main App Initialization ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Element References ---
    const termsModal = document.getElementById('termsModal');
    const authModal = document.getElementById('authModal');
    const agreeBtn = document.getElementById('agreeBtn');
    const termsCheckbox = document.getElementById('termsCheckbox');
    const skipBtn = document.getElementById('skipBtn');
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
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const infoModalCloseBtn = infoModal.querySelector('.close-btn');
    const authActionBtn = document.getElementById('authActionBtn');
    const managePublicationsBtn = document.getElementById('managePublicationsBtn');
    const publishedRoutesModal = document.getElementById('publishedRoutesModal');
    const publishedRoutesModalCloseBtn = publishedRoutesModal.querySelector('.close-btn');
    const viewTermsLink = document.getElementById('viewTermsLink');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const profileModal = document.getElementById('profileModal');
    const profileModalCloseBtn = profileModal.querySelector('.close-btn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const publicProfileModal = document.getElementById('publicProfileModal');
    const publicProfileModalCloseBtn = publicProfileModal.querySelector('.close-btn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const ageCheckbox = document.getElementById('ageCheckbox');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const usernameInput = document.getElementById('usernameInput');
    const safetyModal = document.getElementById('safetyModal');
    const safetyModalOkBtn = document.getElementById('safetyModalOkBtn');
    const safetyModalCloseBtn = safetyModal.querySelector('.close-btn');
    const changeStyleBtn = document.getElementById('changeStyleBtn');


    // --- Initial UI Setup ---
    if (sessionStorage.getItem('termsAccepted')) {
        termsModal.style.display = 'none';
        document.getElementById('userStatus').style.display = 'flex';
    } else {
        termsModal.style.display = 'flex';
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

    // --- Event Listeners ---
    const validateSignUpForm = () => {
        const isEmailValid = emailInput.value.includes('@');
        const isPasswordValid = passwordInput.value.length >= 6;
        const isUsernameValid = usernameInput.value.trim().length >= 3;
        const isAgeChecked = ageCheckbox.checked;
        if (isSignUpMode) {
            authActionBtn.disabled = !(isEmailValid && isPasswordValid && isUsernameValid && isAgeChecked);
        } else {
            authActionBtn.disabled = !(isEmailValid && isPasswordValid);
        }
    };
    emailInput.addEventListener('input', validateSignUpForm);
    passwordInput.addEventListener('input', validateSignUpForm);
    usernameInput.addEventListener('input', validateSignUpForm);
    ageCheckbox.addEventListener('change', validateSignUpForm);

    infoBtn.addEventListener('click', () => infoModal.style.display = 'flex');
    infoModalCloseBtn.addEventListener('click', () => infoModal.style.display = 'none');
    viewTermsLink.addEventListener('click', (e) => {
        e.preventDefault();
        infoModal.style.display = 'none';
        termsModal.style.display = 'flex';
    });
    termsCheckbox.addEventListener('change', () => agreeBtn.disabled = !termsCheckbox.checked);
    agreeBtn.addEventListener('click', () => {
        termsModal.style.display = 'none';
        sessionStorage.setItem('termsAccepted', 'true');
        document.getElementById('userStatus').style.display = 'flex';
        if (!currentUser) authModal.style.display = 'flex';
    });
    loginSignupBtn.addEventListener('click', () => authModal.style.display = 'flex');
    document.getElementById('switchAuthModeLink').addEventListener('click', (e) => {
        e.preventDefault();
        isSignUpMode = !isSignUpMode;
        updateAuthModalUI();
    });
    authActionBtn.addEventListener('click', async () => {
        if (isSignUpMode) await handleSignUp();
        else await handleLogIn();
    });
    document.getElementById('logoutBtn').addEventListener('click', async () => await signOut(auth));
    skipBtn.addEventListener('click', () => authModal.style.display = 'none');
    findMeBtn.addEventListener('click', findMe);
    trackBtn.addEventListener('click', toggleTracking);
    pictureBtn.addEventListener('click', () => cameraInput.click());
    cameraInput.addEventListener('change', handlePhoto);
    dataBtn.addEventListener('click', () => dataModal.style.display = 'flex');
    closeDataModalBtn.addEventListener('click', () => dataModal.style.display = 'none');
    sessionsModalCloseBtn.addEventListener('click', () => sessionsModal.style.display = 'none');
    localSessionsModalCloseBtn.addEventListener('click', () => localSessionsModal.style.display = 'none');
    publishedRoutesModalCloseBtn.addEventListener('click', () => publishedRoutesModal.style.display = 'none');
    profileModalCloseBtn.addEventListener('click', () => profileModal.style.display = 'none');
    publicProfileModalCloseBtn.addEventListener('click', () => publicProfileModal.style.display = 'none');
    safetyModalCloseBtn.addEventListener('click', () => safetyModal.style.display = 'none');
    safetyModalOkBtn.addEventListener('click', () => {
        // sessionStorage.setItem('safetyWarningSeen', 'true');
        safetyModal.style.display = 'none';
        startTracking();
    });
    
    window.addEventListener('click', (event) => {
        const modals = [dataModal, sessionsModal, localSessionsModal, infoModal, authModal, publishedRoutesModal, profileModal, publicProfileModal, safetyModal];
        if (modals.includes(event.target)) modals.forEach(m => m.style.display = 'none');
    });
    
    saveBtn.addEventListener('click', saveSession);
    loadBtn.addEventListener('click', () => {
        dataModal.style.display = 'none';
        loadSession();
    });
    exportBtn.addEventListener('click', exportGeoJSON);
    communityBtn.addEventListener('click', toggleCommunityView);
    publishBtn.addEventListener('click', publishRoute);
    managePublicationsBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert("You must be logged in to manage your publications.");
            return;
        }
        dataModal.style.display = 'none';
        populatePublishedRoutesList();
        publishedRoutesModal.style.display = 'flex';
    });
    editProfileBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert("You must be logged in to edit your profile.");
            return;
        }
        dataModal.style.display = 'none';
        loadProfileForEditing();
        profileModal.style.display = 'flex';
    });
    saveProfileBtn.addEventListener('click', saveProfile);
    deleteAccountBtn.addEventListener('click', handleAccountDeletion);
    changeStyleBtn.addEventListener('click', changeMapStyle);
});

// --- Firebase Auth State Listener ---
onAuthStateChanged(auth, async (user) => {
    const userStatus = document.getElementById('userStatus');
    const loggedInContent = document.getElementById('loggedInContent');
    const guestContent = document.getElementById('guestContent');
    const userEmailSpan = document.getElementById('userEmail');
    const authModal = document.getElementById('authModal');
    const publishBtn = document.getElementById('publishBtn');
    const managePublicationsBtn = document.getElementById('managePublicationsBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    
    if(userStatus) userStatus.style.display = 'flex';

    if (user) {
        currentUser = user;
        try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const username = docSnap.data().username;
                if (userEmailSpan) userEmailSpan.textContent = `Logged in as: ${username}`;
            } else {
                if (userEmailSpan) userEmailSpan.textContent = `Logged in`;
            }
        } catch (error) {
            console.error("Error fetching username:", error);
            if (userEmailSpan) userEmailSpan.textContent = `Logged in`;
        }
        if (loggedInContent) loggedInContent.style.display = 'flex';
        if (guestContent) guestContent.style.display = 'none';
        if (authModal) authModal.style.display = 'none';
        if (publishBtn) publishBtn.style.display = 'block';
        if (managePublicationsBtn) managePublicationsBtn.style.display = 'block';
        if (editProfileBtn) editProfileBtn.style.display = 'block';
    } else {
        currentUser = null;
        if (loggedInContent) loggedInContent.style.display = 'none';
        if (guestContent) guestContent.style.display = 'block';
        if (publishBtn) publishBtn.style.display = 'none';
        if (managePublicationsBtn) managePublicationsBtn.style.display = 'none';
        if (editProfileBtn) editProfileBtn.style.display = 'none';
    }
});


// --- Functions ---
function initializeMapLayers() {
    if (!map.getSource('user-route')) {
        map.addSource('user-route', {
            'type': 'geojson',
            'data': { 'type': 'Feature', 'geometry': { 'type': 'LineString', 'coordinates': routeCoordinates } }
        });
    }
    if (!map.getLayer('user-route')) {
        map.addLayer({
            'id': 'user-route', 'type': 'line', 'source': 'user-route',
            'layout': { 'line-join': 'round', 'line-cap': 'round' },
            'paint': { 'line-color': '#007bff', 'line-width': 5 }
        });
    }
    if (!map.getSource('user-location-point')) {
        map.addSource('user-location-point', {
            'type': 'geojson',
            'data': { 'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': [] } }
        });
    }
    if (!map.getLayer('user-location-pulse')) {
        map.addLayer({
            'id': 'user-location-pulse', 'type': 'circle', 'source': 'user-location-point',
            'paint': { 'circle-radius': 15, 'circle-color': '#007bff', 'circle-opacity': 0.2 }
        });
    }
    if (!map.getLayer('user-location-dot')) {
        map.addLayer({
            'id': 'user-location-dot', 'type': 'circle', 'source': 'user-location-point',
            'paint': { 'circle-radius': 6, 'circle-color': '#fff', 'circle-stroke-width': 2, 'circle-stroke-color': '#007bff' }
        });
    }
}

function changeMapStyle() {
    currentStyleIndex = (currentStyleIndex + 1) % mapStyles.length;
    const newStyle = mapStyles[currentStyleIndex];
    map.setStyle(newStyle.url);
    map.once('style.load', () => {
        initializeMapLayers();
        markers.forEach(marker => marker.addTo(map));
        if (isCommunityViewOn) {
            fetchAndDisplayCommunityRoutes();
        }
    });
}
function convertRouteForFirestore(coordsArray) {
    return coordsArray.map(coord => ({ lng: coord[0], lat: coord[1] }));
}
function convertRouteFromFirestore(coordsObjects) {
    if (!coordsObjects) return [];
    return coordsObjects.map(coord => [coord.lng, coord.lat]);
}
function convertPinsForFirestore(pinsArray) {
    return pinsArray.map(pin => {
        const newPin = { ...pin };
        if (Array.isArray(newPin.coords)) {
            newPin.coords = { lng: newPin.coords[0], lat: newPin.coords[1] };
        }
        return newPin;
    });
}
function convertPinsFromFirestore(pinsObjects) {
    if (!pinsObjects) return [];
    return pinsObjects.map(pin => {
        const newPin = { ...pin };
        if (newPin.coords && typeof newPin.coords === 'object' && !Array.isArray(newPin.coords)) {
            newPin.coords = [newPin.coords.lng, newPin.coords.lat];
        }
        return newPin;
    });
}
function updateAuthModalUI() {
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authActionBtn = document.getElementById('authActionBtn');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const usernameInput = document.getElementById('usernameInput');
    const ageCheckbox = document.getElementById('ageCheckbox');
    
    document.getElementById('authError').textContent = '';
    
    if (isSignUpMode) {
        authTitle.textContent = 'Create an Account';
        authSubtitle.innerHTML = 'Or <a href="#" id="switchAuthModeLink">log in to an existing account.</a>';
        authActionBtn.textContent = 'Sign Up';
        authForm.classList.add('signup-mode'); authForm.classList.remove('login-mode');
    } else {
        authTitle.textContent = 'Log In';
        authSubtitle.innerHTML = 'Or <a href="#" id="switchAuthModeLink">create a new account.</a>';
        authActionBtn.textContent = 'Log In';
        authForm.classList.add('login-mode'); authForm.classList.remove('signup-mode');
    }

    const isEmailValid = emailInput.value.includes('@');
    const isPasswordValid = passwordInput.value.length >= 6;
    const isUsernameValid = usernameInput.value.trim().length >= 3;
    const isAgeChecked = ageCheckbox.checked;
    
    if (isSignUpMode) {
        authActionBtn.disabled = !(isEmailValid && isPasswordValid && isUsernameValid && isAgeChecked);
    } else {
        authActionBtn.disabled = !(isEmailValid && isPasswordValid);
    }

    document.getElementById('switchAuthModeLink').addEventListener('click', (e) => {
        e.preventDefault();
        isSignUpMode = !isSignUpMode;
        updateAuthModalUI();
    });
}
async function handleSignUp() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const username = document.getElementById('usernameInput').value;
    const ageCheckbox = document.getElementById('ageCheckbox');
    const authError = document.getElementById('authError');
    authError.textContent = '';
    
    if (!ageCheckbox.checked) {
        authError.textContent = 'You must certify that you are 18 or older to sign up.';
        return;
    }
    if (!username || username.trim().length < 3) {
        authError.textContent = 'Username must be at least 3 characters.'; return;
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
            username: username,
            email: userCredential.user.email,
            totalPins: 0,
            totalDistance: 0,
            totalRoutes: 0,
            badges: {}
        });
    } catch (error) { authError.textContent = error.message; }
}
async function handleLogIn() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const authError = document.getElementById('authError');
    authError.textContent = '';
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) { authError.textContent = error.message; }
}
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
        const userLocationSource = map.getSource('user-location-point');
        if (userLocationSource) {
            userLocationSource.setData({ 'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': [] } });
        }
    } else {
        document.getElementById('safetyModal').style.display = 'flex';
    }
}

function startTracking() {
    const trackBtn = document.getElementById('trackBtn');
    routeCoordinates = [];
    navigator.geolocation.getCurrentPosition(position => {
        map.flyTo({ center: [position.coords.longitude, position.coords.latitude], zoom: 16 });
    });
    trackingWatcher = navigator.geolocation.watchPosition(position => {
        const newCoord = [position.coords.longitude, position.coords.latitude];
        routeCoordinates.push(newCoord);
        if (map.getSource('user-route')) {
            map.getSource('user-route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } });
        }
        if (map.getSource('user-location-point')) {
            map.getSource('user-location-point').setData({ 'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': newCoord } });
        }
    }, () => alert("Error watching position."), { enableHighAccuracy: true });
    
    trackBtn.textContent = '🛑 Stop Tracking';
    trackBtn.classList.add('tracking');
}

async function handlePhoto(event) {
    const pictureBtn = document.getElementById('pictureBtn');
    const originalButtonText = pictureBtn.innerHTML;

    if (!event.target.files || event.target.files.length === 0) {
        console.log("No file selected.");
        event.target.value = '';
        return;
    }
    
    const file = event.target.files[0];
    pictureBtn.innerHTML = 'Processing...';
    pictureBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(async (position) => {
        const coords = [position.coords.longitude, position.coords.latitude];
        
        if (!currentUser) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = e => {
                const pinInfo = { id: `pin-${Date.now()}`, coords: coords, image: e.target.result, title: 'New Photo' };
                photoPins.push(pinInfo);
                addPhotoMarker(pinInfo);
                pictureBtn.innerHTML = originalButtonText;
                pictureBtn.disabled = false;
                event.target.value = '';
            };
            return;
        }
        
        try {
            const timestamp = Date.now();
            const storageRef = ref(storage, `photos/${currentUser.uid}/${timestamp}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            const pinInfo = { id: `pin-${timestamp}`, coords: coords, imageURL: downloadURL, title: 'New Photo' };
            photoPins.push(pinInfo);
            addPhotoMarker(pinInfo);

        } catch (error) {
            console.error("Error uploading photo:", error);
            alert("Photo upload failed.");
        } finally {
            pictureBtn.innerHTML = originalButtonText;
            pictureBtn.disabled = false;
            event.target.value = '';
        }

    }, () => {
        alert("Could not get your location. Photo was not pinned.");
        pictureBtn.innerHTML = originalButtonText;
        pictureBtn.disabled = false;
        event.target.value = '';
    }, { enableHighAccuracy: true });
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
        const q = query(collection(db, "publishedRoutes"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        clearCommunityRoutes();
        querySnapshot.forEach(doc => {
            const routeData = doc.data();
            const routeId = doc.id;
            const mapboxCoords = convertRouteFromFirestore(routeData.route);
            const mapboxPins = convertPinsFromFirestore(routeData.pins);
            map.addSource(`community-route-${routeId}`, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: mapboxCoords } } });
            map.addLayer({ id: `community-route-${routeId}`, type: 'line', source: `community-route-${routeId}`, paint: { 'line-color': '#28a745', 'line-width': 4, 'line-opacity': 0.7 } });
            communityLayers.push({ id: `community-route-${routeId}`, type: 'layer' });
            if (mapboxPins) {
                mapboxPins.forEach(pin => {
                    const el = document.createElement('div');
                    el.className = 'photo-marker';
                    el.style.backgroundImage = `url(${pin.imageURL})`;
                    el.style.borderColor = '#28a745';
                    const popupHTML = `
                        <div>
                            <img src="${pin.imageURL}" alt="Community photo" style="width:100%; border-radius: 4px;"/>
                            <p style="margin: 5px 0 0;"><strong>${pin.title}</strong></p>
                            <small>By: <a href="#" class="profile-link" data-userid="${routeData.userId}">${routeData.username || 'A user'}</a></small>
                        </div>`;
                    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);
                    popup.on('open', () => {
                        document.querySelectorAll('.profile-link').forEach(link => {
                            link.addEventListener('click', (e) => {
                                e.preventDefault();
                                showPublicProfile(e.target.dataset.userid);
                            });
                        });
                    });
                    const marker = new mapboxgl.Marker(el).setLngLat(pin.coords).setPopup(popup).addTo(map);
                    communityLayers.push({ id: `community-marker-${pin.id}`, type: 'marker', instance: marker });
                });
            }
        });
    } catch (error) { console.error("Error fetching community routes:", error); alert("Could not load community data."); }
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
        alert("You need a tracked route and at least one photo pin to publish."); return;
    }
    try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) throw new Error("Could not find user profile.");
        const username = docSnap.data().username;
        const firestoreReadyPins = convertPinsForFirestore(photoPins);
        const firestoreReadyRoute = convertRouteForFirestore(routeCoordinates);
        await addDoc(collection(db, "publishedRoutes"), { userId: currentUser.uid, username: username, timestamp: new Date(), route: firestoreReadyRoute, pins: firestoreReadyPins });
        alert("Success! Your route has been published.");
        clearCurrentSession();
        document.getElementById('dataModal').style.display = 'none';
    } catch (error) { console.error("Error publishing route:", error); alert("There was an error publishing your route."); }
}
async function saveSession() {
    const dataModal = document.getElementById('dataModal');
    if (!currentUser) {
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
    const sessionName = prompt("Name this cloud session:", `Cleanup on ${new Date().toLocaleDateString()}`);
    if (sessionName) {
        try {
            const firestoreReadyPins = convertPinsForFirestore(photoPins);
            const firestoreReadyRoute = convertRouteForFirestore(routeCoordinates);
            await addDoc(collection(db, "users", currentUser.uid, "privateSessions"), { sessionName, timestamp: new Date(), pins: firestoreReadyPins, route: firestoreReadyRoute });
            alert(`Session "${sessionName}" saved to your account!`);
            dataModal.style.display = 'none';
        } catch (error) { console.error("Error saving session to Firestore:", error); alert("Could not save session to your account."); }
    }
}
async function loadSession() {
    if (!currentUser) {
        populateLocalSessionList();
        document.getElementById('localSessionsModal').style.display = 'flex';
        return;
    }
    await populateSessionList();
    document.getElementById('sessionsModal').style.display = 'flex';
}
function populateLocalSessionList() {
    const localSessionList = document.getElementById('localSessionList');
    const guestSessions = JSON.parse(localStorage.getItem('guestSessions')) || [];
    localSessionList.innerHTML = '';
    if (guestSessions.length === 0) {
        localSessionList.innerHTML = '<li>No locally saved sessions found.</li>'; return;
    }
    guestSessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach((sessionData, index) => {
        const li = document.createElement('li');
        const contentDiv = document.createElement('div');
        contentDiv.style.flexGrow = '1';
        contentDiv.innerHTML = `<span>${sessionData.sessionName}</span><br><small class="session-date">${new Date(sessionData.timestamp).toLocaleDateString()}</small>`;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-session-btn';
        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        contentDiv.addEventListener('click', () => loadSpecificLocalSession(index));
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            deleteLocalSession(index, sessionData.sessionName);
        });
        localSessionList.appendChild(li);
    });
}
function deleteLocalSession(sessionIndex, sessionName) {
    if (confirm(`Are you sure you want to delete the local session "${sessionName}"? This cannot be undone.`)) {
        let guestSessions = JSON.parse(localStorage.getItem('guestSessions')) || [];
        guestSessions.splice(sessionIndex, 1);
        localStorage.setItem('guestSessions', JSON.stringify(guestSessions));
        alert(`Session "${sessionName}" has been deleted.`);
        populateLocalSessionList();
    }
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
            sessionList.innerHTML = '<li>No saved cloud sessions found.</li>'; return;
        }
        querySnapshot.forEach(doc => {
            const sessionData = doc.data();
            const li = document.createElement('li');
            const contentDiv = document.createElement('div');
            contentDiv.style.flexGrow = '1';
            contentDiv.innerHTML = `<span>${sessionData.sessionName}</span><br><small class="session-date">${new Date(sessionData.timestamp.seconds * 1000).toLocaleDateString()}</small>`;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-session-btn';
            li.appendChild(contentDiv);
            li.appendChild(deleteBtn);
            contentDiv.addEventListener('click', () => loadSpecificSession(doc.id));
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                deletePrivateSession(doc.id, sessionData.sessionName);
            });
            sessionList.appendChild(li);
        });
    } catch (error) { console.error("Error fetching sessions:", error); sessionList.innerHTML = '<li>Could not load sessions.</li>'; }
}
async function deletePrivateSession(sessionId, sessionName) {
    if (confirm(`Are you sure you want to delete the cloud session "${sessionName}"? This cannot be undone.`)) {
        try {
            await deleteDoc(doc(db, "users", currentUser.uid, "privateSessions", sessionId));
            alert(`Session "${sessionName}" has been deleted.`);
            populateSessionList();
        } catch (error) {
            console.error("Error deleting session:", error);
            alert("Failed to delete the session. Please try again.");
        }
    }
}
async function loadSpecificSession(sessionId) {
    try {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid, "privateSessions", sessionId));
        if (docSnap.exists()) {
            clearCurrentSession();
            const sessionData = docSnap.data();
            const convertedData = { ...sessionData, pins: convertPinsFromFirestore(sessionData.pins), route: convertRouteFromFirestore(sessionData.route) };
            displaySessionData(convertedData);
            alert(`Session "${sessionData.sessionName}" loaded!`);
            document.getElementById('sessionsModal').style.display = 'none';
        }
    } catch (error) { console.error("Error loading specific session:", error); alert("Failed to load the session."); }
}
function clearCurrentSession() {
    markers.forEach(marker => marker.remove());
    markers = [];
    photoPins = [];
    routeCoordinates = [];
    if (map && map.getSource('user-route')) map.getSource('user-route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
}
function displaySessionData(data) {
    photoPins = data.pins || [];
    routeCoordinates = data.route || [];
    photoPins.forEach(pin => addPhotoMarker(pin));
    if(map && map.getSource('user-route')) map.getSource('user-route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } });
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

async function populatePublishedRoutesList() {
    const publishedRoutesList = document.getElementById('publishedRoutesList');
    publishedRoutesList.innerHTML = '<li>Loading your publications...</li>';
    try {
        const routesRef = collection(db, "publishedRoutes");
        const q = query(routesRef, where("userId", "==", currentUser.uid), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            publishedRoutesList.innerHTML = '<li>You have not published any routes yet.</li>';
            return;
        }
        publishedRoutesList.innerHTML = '';
        querySnapshot.forEach(doc => {
            const routeData = doc.data();
            const li = document.createElement('li');
            const contentDiv = document.createElement('div');
            contentDiv.style.flexGrow = '1';
            contentDiv.innerHTML = `<span>Route published on</span><br><small class="session-date">${new Date(routeData.timestamp.seconds * 1000).toLocaleString()}</small>`;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-session-btn';
            li.appendChild(contentDiv);
            li.appendChild(deleteBtn);
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                deletePublishedRoute(doc.id);
            });
            publishedRoutesList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching published routes:", error);
        publishedRoutesList.innerHTML = '<li>Could not load your publications.</li>';
    }
}

async function deletePublishedRoute(routeId) {
    if (confirm(`Are you sure you want to permanently delete this published route from the community map? This action cannot be undone.`)) {
        try {
            await deleteDoc(doc(db, "publishedRoutes", routeId));
            alert(`Your route has been deleted from the community map.`);
            populatePublishedRoutesList();
            if (isCommunityViewOn) {
                clearCommunityRoutes();
                fetchAndDisplayCommunityRoutes();
            }
        } catch (error) {
            console.error("Error deleting published route:", error);
            alert("Failed to delete the route. Please check the console for errors.");
        }
    }
}

async function loadProfileForEditing() {
    if (!currentUser) return;
    try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const profileData = docSnap.data();
            document.getElementById('bioInput').value = profileData.bio || '';
            document.getElementById('locationInput').value = profileData.location || '';
            document.getElementById('coffeeLinkInput').value = profileData.buyMeACoffeeLink || '';
        }
    } catch (error) {
        console.error("Error loading profile data:", error);
        alert("Could not load your profile data.");
    }
}

async function saveProfile() {
    if (!currentUser) return;
    const bio = document.getElementById('bioInput').value;
    const location = document.getElementById('locationInput').value;
    const coffeeLink = document.getElementById('coffeeLinkInput').value;
    try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
            bio: bio,
            location: location,
            buyMeACoffeeLink: coffeeLink
        });

        const userEmailSpan = document.getElementById('userEmail');
        const userProfile = await getDoc(userDocRef);
        if (userProfile.exists() && userEmailSpan) {
            userEmailSpan.textContent = `Logged in as: ${userProfile.data().username}`;
        }

        alert("Your profile has been updated successfully!");
        document.getElementById('profileModal').style.display = 'none';
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("There was an error saving your profile. Please try again.");
    }
}

async function showPublicProfile(userId) {
    if (!userId) return;

    try {
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const profileData = docSnap.data();
            const publicProfileModal = document.getElementById('publicProfileModal');
            const profileSupportBtn = document.getElementById('profileSupportBtn');
            const profileAchievementsContainer = document.getElementById('profileAchievements');
            
            document.getElementById('profileUsername').textContent = profileData.username || 'Anonymous User';
            document.getElementById('profileLocation').textContent = profileData.location || '';
            document.getElementById('profileBio').textContent = profileData.bio || 'This user has not written a bio yet.';
            
            profileAchievementsContainer.innerHTML = '';
            const userBadges = profileData.badges || {};
            let earnedBadgesCount = 0;
            for (const badgeKey in allBadges) {
                if (userBadges[badgeKey] === true) {
                    earnedBadgesCount++;
                    const badgeInfo = allBadges[badgeKey];
                    const badgeElement = document.createElement('div');
                    badgeElement.className = 'badge-item';
                    badgeElement.textContent = badgeInfo.icon;
                    badgeElement.title = `${badgeInfo.name}: ${badgeInfo.description}`;
                    profileAchievementsContainer.appendChild(badgeElement);
                }
            }
            if (earnedBadgesCount === 0) {
                profileAchievementsContainer.innerHTML = '<p class="no-badges-message">This user hasn\'t earned any badges yet.</p>';
            }

            if (profileData.buyMeACoffeeLink) {
                profileSupportBtn.style.display = 'block';
                profileSupportBtn.onclick = () => {
                    window.open(profileData.buyMeACoffeeLink, '_blank');
                };
            } else {
                profileSupportBtn.style.display = 'none';
            }
            
            publicProfileModal.style.display = 'flex';
        } else {
            alert("Could not find this user's profile.");
        }
    } catch (error) {
        console.error("Error fetching public profile:", error);
        alert("There was an error loading the user's profile.");
    }
}
async function handleAccountDeletion() {
    if (!currentUser) return;

    const confirmation1 = confirm("DANGER: Are you absolutely sure you want to permanently delete your account? This action cannot be undone.");
    if (!confirmation1) return;

    const confirmation2 = confirm("All of your private saved sessions and public routes will be deleted forever. Are you still sure?");
    if (!confirmation2) return;

    try {
        console.log("Starting account deletion process for user:", currentUser.uid);

        const privateSessionsQuery = query(collection(db, "users", currentUser.uid, "privateSessions"));
        const privateSessionsSnapshot = await getDocs(privateSessionsQuery);
        const privateDeletePromises = [];
        privateSessionsSnapshot.forEach(doc => {
            privateDeletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(privateDeletePromises);
        console.log("Private sessions deleted.");

        const publishedRoutesQuery = query(collection(db, "publishedRoutes"), where("userId", "==", currentUser.uid));
        const publishedRoutesSnapshot = await getDocs(publishedRoutesQuery);
        const publicDeletePromises = [];
        publishedRoutesSnapshot.forEach(doc => {
            publicDeletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(publicDeletePromises);
        console.log("Published routes deleted.");

        await deleteDoc(doc(db, "users", currentUser.uid));
        console.log("User profile document deleted.");

        await deleteUser(currentUser);
        
        alert("Your account and all associated data have been permanently deleted.");
        document.getElementById('profileModal').style.display = 'none';
        
    } catch (error) {
        console.error("Error deleting account:", error);
        if (error.code === 'auth/requires-recent-login') {
            alert("This is a sensitive operation and requires you to have logged in recently. Please log out and log back in to delete your account.");
        } else {
            alert("An error occurred while deleting your account. Please check the console for details.");
        }
    }
}