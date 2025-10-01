document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('atlas').setView([51.505, -0.09], 13); // Default center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Add pins for locations
    const locations = entries.filter(e => e.type === 'LOCATION');
    locations.forEach(loc => {
        L.marker([51.5 + (loc.id * 0.01), -0.09 + (loc.id * 0.01)])
            .addTo(map)
            .bindPopup(`<b>${loc.title}</b><br>${loc.content.description}`);
    });
});