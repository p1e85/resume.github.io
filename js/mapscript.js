// IMPORTANT: Replace with your actual Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoicDFjcmVhdGlvbnMiLCJhIjoiY2p6ajZvejJmMDZhaTNkcWpiN294dm12eCJ9.8ckNT6kfuJry7K7GAeIuxw';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: [-98.5795, 39.8283], // starting position [lng, lat]
    zoom: 3 // starting zoom
});

// Get references to the HTML buttons
const findMeBtn = document.getElementById('findMeBtn');
const trackBtn = document.getElementById('trackBtn');
const pictureBtn = document.getElementById('pictureBtn');
const cameraInput = document.getElementById('cameraInput');

let trackingWatcher = null; // To hold the watchPosition ID
let routeCoordinates = [];   // Array to store tracking coordinates
let photoPins = [];          // Array to store our photo pin data

// --- 1. Find Location Functionality ---
findMeBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);
        map.flyTo({ center: [longitude, latitude], zoom: 15 });
    }, () => {
        alert("Could not get your location. Please allow location access.");
    }, { enableHighAccuracy: true });
});

// --- 2. Track Location Functionality ---
trackBtn.addEventListener('click', () => {
    if (trackingWatcher) {
        navigator.geolocation.clearWatch(trackingWatcher);
        trackingWatcher = null;
        trackBtn.textContent = '🛰️ Start Tracking';
        trackBtn.classList.remove('tracking');
    } else {
        routeCoordinates = [];
        if (map.getSource('route')) {
            map.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
        }
        trackingWatcher = navigator.geolocation.watchPosition(position => {
            const { latitude, longitude } = position.coords;
            const newCoord = [longitude, latitude];
            routeCoordinates.push(newCoord);
            map.flyTo({ center: newCoord, zoom: 16 });
            if (map.getSource('route')) {
                map.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } });
            }
        }, () => {
            alert("Error watching position.");
        }, { enableHighAccuracy: true });
        trackBtn.textContent = '🛑 Stop Tracking';
        trackBtn.classList.add('tracking');
    }
});

// --- 3. Pin Picture Functionality ---
pictureBtn.addEventListener('click', () => {
    cameraInput.click();
});

cameraInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        const imageDataUrl = e.target.result;

        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const coords = [longitude, latitude];
            const pinId = `pin-${Date.now()}`;
            
            const pinInfo = {
                id: pinId,
                coords: coords,
                image: imageDataUrl,
                title: 'New Photo'
            };

            photoPins.push(pinInfo);
            savePinsToLocalStorage();
            addPhotoMarker(pinInfo);

        }, () => {
            alert("Could not get location for the picture.");
        }, { enableHighAccuracy: true });
    };
    event.target.value = '';
});

// --- 4. Helper Functions for Photos ---

/**
 * Creates the HTML content for a photo pin's popup. (UPDATED)
 * @param {object} pinInfo - The object containing pin data.
 * @returns {string} - The HTML string for the popup.
 */
function createPhotoPopup(pinInfo) {
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

/**
 * Adds a photo marker and its interactive popup to the map. (UPDATED)
 * @param {object} pinInfo - The object containing pin data.
 */
function addPhotoMarker(pinInfo) {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="%23FF5722"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`;
    el.style.width = '36px';
    el.style.height = '36px';
    el.style.backgroundSize = '100%';
    el.style.cursor = 'pointer';

    const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(createPhotoPopup(pinInfo));
        
    const marker = new mapboxgl.Marker(el)
        .setLngLat(pinInfo.coords)
        .setPopup(popup)
        .addTo(map);

    // Add listeners for the buttons inside the popup
    popup.on('open', () => {
        const saveBtn = document.getElementById(`save-${pinInfo.id}`);
        const titleInput = document.getElementById(`title-${pinInfo.id}`);
        const deleteBtn = document.getElementById(`delete-${pinInfo.id}`);

        saveBtn.addEventListener('click', () => {
            pinInfo.title = titleInput.value;
            savePinsToLocalStorage();
            popup.remove();
            alert("Title saved!");
        });

        // **NEW** Delete button functionality
        deleteBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete this pin?")) {
                // Remove the pin from our data array
                photoPins = photoPins.filter(p => p.id !== pinInfo.id);
                // Update localStorage
                savePinsToLocalStorage();
                // Remove the marker from the map
                marker.remove();
            }
        });
    });
}

/**
 * Saves the entire photoPins array to the browser's localStorage.
 */
function savePinsToLocalStorage() {
    localStorage.setItem('photoPins', JSON.stringify(photoPins));
}

/**
 * Loads pins from localStorage when the page loads.
 */
function loadPinsFromLocalStorage() {
    const savedPins = JSON.parse(localStorage.getItem('photoPins'));
    if (savedPins) {
        photoPins = savedPins;
        photoPins.forEach(pin => addPhotoMarker(pin));
    }
}

// --- Map Load Event ---
map.on('load', () => {
    // Add the route source and layer for tracking
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

    // Load any saved photo pins from previous sessions
    loadPinsFromLocalStorage();
});
