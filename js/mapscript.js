// --- NEW: Terms of Use Modal Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const termsModal = document.getElementById('termsModal');
    const termsCheckbox = document.getElementById('termsCheckbox');
    const agreeBtn = document.getElementById('agreeBtn');

    // Check if the user has already agreed in this session
    if (sessionStorage.getItem('termsAccepted')) {
        termsModal.style.display = 'none';
    } else {
        termsModal.style.display = 'flex';
    }

    // Enable the "I Agree" button only when the checkbox is ticked
    termsCheckbox.addEventListener('change', () => {
        if (termsCheckbox.checked) {
            agreeBtn.disabled = false;
        } else {
            agreeBtn.disabled = true;
        }
    });

    // When the user agrees, hide the modal and save the state
    agreeBtn.addEventListener('click', () => {
        termsModal.style.display = 'none';
        sessionStorage.setItem('termsAccepted', 'true');
    });
});

// --- Your existing JavaScript code continues below ---
// IMPORTANT: Replace with your actual Mapbox access token
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
// ... rest of your script.js file


// IMPORTANT: Replace with your actual Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoicDFjcmVhdGlvbnMiLCJhIjoiY2p6ajZvejJmMDZhaTNkcWpiN294dm12eCJ9.8ckNT6kfuJry7K7GAeIuxw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-98.5795, 39.8283],
    zoom: 3
});

// --- Element References ---
const findMeBtn = document.getElementById('findMeBtn');
const trackBtn = document.getElementById('trackBtn');
const pictureBtn = document.getElementById('pictureBtn');
const cameraInput = document.getElementById('cameraInput');
const dataBtn = document.getElementById('dataBtn');
const modal = document.getElementById('dataModal');
const closeBtn = document.querySelector('.close-btn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const exportBtn = document.getElementById('exportBtn');

// --- Global State ---
let trackingWatcher = null;
let routeCoordinates = [];
let photoPins = [];
let markers = []; // Keep track of marker objects to remove them later

// --- Mapbox Setup ---
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
findMeBtn.addEventListener('click', findMe);
trackBtn.addEventListener('click', toggleTracking);
pictureBtn.addEventListener('click', () => cameraInput.click());
cameraInput.addEventListener('change', handlePhoto);
dataBtn.addEventListener('click', () => modal.style.display = 'block');
closeBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});
saveBtn.addEventListener('click', saveSession);
loadBtn.addEventListener('click', loadSession);
exportBtn.addEventListener('click', exportGeoJSON);

// --- Core Functions ---
function findMe() {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);
        map.flyTo({ center: [longitude, latitude], zoom: 15 });
    }, () => alert("Could not get your location."), { enableHighAccuracy: true });
}

function toggleTracking() {
    if (trackingWatcher) {
        navigator.geolocation.clearWatch(trackingWatcher);
        trackingWatcher = null;
        trackBtn.textContent = '🛰️ Start Tracking';
        trackBtn.classList.remove('tracking');
    } else {
        trackingWatcher = navigator.geolocation.watchPosition(position => {
            const newCoord = [position.coords.longitude, position.coords.latitude];
            routeCoordinates.push(newCoord);
            map.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } });
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
    
    const marker = new mapboxgl.Marker(el)
        .setLngLat(pinInfo.coords)
        .setPopup(popup)
        .addTo(map);

    markers.push(marker); // Add to our array of markers

    popup.on('open', () => {
        document.getElementById(`save-${pinInfo.id}`).addEventListener('click', () => {
            const titleInput = document.getElementById(`title-${pinInfo.id}`);
            const pin = photoPins.find(p => p.id === pinInfo.id);
            pin.title = titleInput.value;
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

// --- Data Management ---
function saveSession() {
    const sessionData = {
        pins: photoPins,
        route: routeCoordinates
    };
    localStorage.setItem('mapSessionData', JSON.stringify(sessionData));
    alert("Session Saved!");
    modal.style.display = 'none';
}

function loadSession() {
    const savedData = JSON.parse(localStorage.getItem('mapSessionData'));
    if (!savedData) {
        alert("No saved session found.");
        return;
    }

    // Clear current map state
    markers.forEach(marker => marker.remove());
    markers = [];
    photoPins = [];
    routeCoordinates = [];

    // Load data
    photoPins = savedData.pins || [];
    routeCoordinates = savedData.route || [];

    // Redraw on map
    photoPins.forEach(pin => addPhotoMarker(pin));
    map.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } });

    alert("Session Loaded!");
    modal.style.display = 'none';
}

function exportGeoJSON() {
    const pinFeatures = photoPins.map(pin => ({
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': pin.coords
        },
        'properties': {
            'title': pin.title,
            // Note: The image data URL can be very long and isn't standard in GeoJSON.
            // For true interoperability, you'd upload the image and link to a URL.
            'image_data_url_truncated': pin.image.substring(0, 50) + '...'
        }
    }));

    const routeFeature = {
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': routeCoordinates
        },
        'properties': {}
    };

    const geojson = {
        'type': 'FeatureCollection',
        'features': [...pinFeatures, routeFeature]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "map_data.geojson");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    modal.style.display = 'none';
}
