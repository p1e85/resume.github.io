const initialData = {
    entries: [
        { id: 1, type: 'CHARACTER', title: 'Hero', content: { description: 'The main protagonist.' }, links: [{ toId: 2, label: 'birthplace' }], backlinks: [] },
        { id: 2, type: 'LOCATION', title: 'Village', content: { description: 'A quiet village.' }, links: [], backlinks: [{ fromId: 1, label: 'birthplace' }] },
    ],
    timelineEvents: [
        { id: 1, content: 'Hero Born', start: '2020-01-01' },
        { id: 2, content: 'Village Founded', start: '2015-06-15' },
    ],
    atlasPins: [
        { id: 1, entryId: 2, lat: 51.51, lng: -0.08, description: 'Village pin' },
    ]
};

// Load or initialize data from localStorage
let lorekeeperData = JSON.parse(localStorage.getItem('lorekeeper_data')) || initialData;

// Save data to localStorage
function saveData() {
    localStorage.setItem('lorekeeper_data', JSON.stringify(lorekeeperData));
}

// Add a new entry
function addEntry(type, title, description) {
    const newEntry = {
        id: lorekeeperData.entries.length + 1,
        type,
        title,
        content: { description },
        links: [],
        backlinks: []
    };
    lorekeeperData.entries.push(newEntry);
    saveData();
}

// Create a bi-directional link
function createLink(fromId, toId, label) {
    const fromEntry = lorekeeperData.entries.find(e => e.id === fromId);
    const toEntry = lorekeeperData.entries.find(e => e.id === toId);
    if (fromEntry && toEntry) {
        fromEntry.links.push({ toId, label });
        toEntry.backlinks.push({ fromId, label });
        saveData();
    }
}

// Add a timeline event
function addTimelineEvent(content, start) {
    const newEvent = {
        id: lorekeeperData.timelineEvents.length + 1,
        content,
        start
    };
    lorekeeperData.timelineEvents.push(newEvent);
    saveData();
}

// Add an atlas pin
function addAtlasPin(entryId, lat, lng, description) {
    const newPin = {
        id: lorekeeperData.atlasPins.length + 1,
        entryId,
        lat,
        lng,
        description
    };
    lorekeeperData.atlasPins.push(newPin);
    saveData();
}

// Export data as JSON file
function exportData() {
    const dataStr = JSON.stringify(lorekeeperData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lorekeeper-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Import data from JSON file
function importData(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const newData = JSON.parse(e.target.result);
            // Basic validation
            if (newData.entries && newData.timelineEvents && newData.atlasPins) {
                lorekeeperData = newData;
                saveData();
                callback(true);
            } else {
                callback(false, 'Invalid data format');
            }
        } catch (err) {
            callback(false, 'Error parsing JSON');
        }
    };
    reader.readAsText(file);
}
