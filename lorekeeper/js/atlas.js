document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('atlas').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const pinForm = document.getElementById('pin-form');
    const pinEntry = document.getElementById('pin-entry');

    // Populate entry dropdown
    function renderDropdown() {
        pinEntry.innerHTML = lorekeeperData.entries.filter(e => e.type === 'LOCATION').length === 0 
            ? '<option value="">No locations available</option>'
            : lorekeeperData.entries
                .filter(e => e.type === 'LOCATION')
                .map(entry => `<option value="${entry.id}">${entry.title}</option>`)
                .join('');
    }

    // Render pins
    function renderPins() {
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });
        if (lorekeeperData.atlasPins.length === 0) {
            document.getElementById('atlas').innerHTML = '<p>No pins yet. Add a location in the Wiki and a pin above!</p>';
        }
        lorekeeperData.atlasPins.forEach(pin => {
            const entry = lorekeeperData.entries.find(e => e.id === pin.entryId);
            L.marker([pin.lat, pin.lng])
                .addTo(map)
                .bindPopup(`<b>${entry?.title || 'Unknown'}</b><br>${pin.description}`);
        });
    }

    // Handle pin form submission
    pinForm.addEventListener('submit', e => {
        e.preventDefault();
        const entryId = parseInt(pinEntry.value);
        if (!entryId) return; // Prevent submission if no locations
        const lat = parseFloat(document.getElementById('pin-lat').value);
        const lng = parseFloat(document.getElementById('pin-lng').value);
        const description = document.getElementById('pin-description').value;
        addAtlasPin(entryId, lat, lng, description);
        renderPins();
        pinForm.reset();
    });

    renderDropdown();
    renderPins();

    // Listen for entry changes (e.g., from imports)
    window.addEventListener('storage', () => {
        lorekeeperData = JSON.parse(localStorage.getItem('lorekeeper_data')) || initialData;
        renderDropdown();
        renderPins();
    });
});
