// IMPORTANT: Replace with your actual Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoicDFjcmVhdGlvbnMiLCJhIjoiY2p6ajZvejJmMDZhaTNkcWpiN294dm12eCJ9.8ckNT6kfuJry7K7GAeIuxw';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: [-98.5795, 39.8283], // starting position [lng, lat] (center of USA)
    zoom: 3 // starting zoom
});

// Get references to the HTML buttons
const findMeBtn = document.getElementById('findMeBtn');
const trackBtn = document.getElementById('trackBtn');
const pictureBtn = document.getElementById('pictureBtn');
const cameraInput = document.getElementById('cameraInput');

let trackingWatcher = null; // To hold the watchPosition ID
let routeCoordinates = [];   // Array to store tracking coordinates

// --- 1. Find Location Functionality ---
findMeBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        // Create a marker
        new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map);
        // Fly to the user's location
        map.flyTo({
            center: [longitude, latitude],
            zoom: 15
        });
    }, () => {
        alert("Could not get your location. Please allow location access.");
    }, { enableHighAccuracy: true });
});

// --- 2. Track Location Functionality ---
trackBtn.addEventListener('click', () => {
    if (trackingWatcher) {
        // --- Stop Tracking ---
        navigator.geolocation.clearWatch(trackingWatcher);
        trackingWatcher = null;
        trackBtn.textContent = '🛰️ Start Tracking';
        trackBtn.classList.remove('tracking');
    } else {
        // --- Start Tracking ---
        // Clear previous route data
        routeCoordinates = [];
        if (map.getSource('route')) {
            map.getSource('route').setData({
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: [] }
            });
        }

        trackingWatcher = navigator.geolocation.watchPosition(position => {
            const { latitude, longitude } = position.coords;
            const newCoord = [longitude, latitude];

            // Add new coordinate to our route array
            routeCoordinates.push(newCoord);

            // Center map on the new location
            map.flyTo({ center: newCoord, zoom: 16 });

            // Update the line on the map
            if (map.getSource('route')) {
                map.getSource('route').setData({
                    type: 'Feature',
                    properties: {},
                    geometry: { type: 'LineString', coordinates: routeCoordinates }
                });
            }
        }, () => {
            alert("Error watching position.");
        }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 });

        trackBtn.textContent = '🛑 Stop Tracking';
        trackBtn.classList.add('tracking');
    }
});

// --- 3. Pin Picture Functionality ---
pictureBtn.addEventListener('click', () => {
    // Trigger the hidden file input
    cameraInput.click();
});

cameraInput.addEventListener('change', (event) => {
    if (event.target.files && event.target.files[0]) {
        // We have a picture, now get the location
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            // Create a custom marker for the picture
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="%23FF5722"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`;
            el.style.width = '36px';
            el.style.height = '36px';
            el.style.backgroundSize = '100%';
            
            // Create a popup (optional)
            const popup = new mapboxgl.Popup({ offset: 25 })
                .setText('A picture was taken here!');

            // Add the marker to the map
            new mapboxgl.Marker(el)
                .setLngLat([longitude, latitude])
                .setPopup(popup)
                .addTo(map);
        }, () => {
            alert("Could not get location for the picture.");
        }, { enableHighAccuracy: true });
    }
});


// Add the route source and layer once the map is loaded
map.on('load', () => {
    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': []
            }
        }
    });
    map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#0000ff', // Blue line
            'line-width': 5
        }
    });
});
