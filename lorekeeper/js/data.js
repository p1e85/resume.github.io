// Mock data (initial entries)
const initialEntries = [
    { id: 1, type: 'CHARACTER', title: 'Hero', content: { description: 'The main protagonist.' }, links: [{ toId: 2, label: 'birthplace' }], backlinks: [] },
    { id: 2, type: 'LOCATION', title: 'Village', content: { description: 'A quiet village.' }, links: [], backlinks: [{ fromId: 1, label: 'birthplace' }] },
];

// Load or initialize entries from localStorage
let entries = JSON.parse(localStorage.getItem('lorekeeper_entries')) || initialEntries;

// Save entries to localStorage
function saveEntries() {
    localStorage.setItem('lorekeeper_entries', JSON.stringify(entries));
}

// Add a new entry
function addEntry(type, title, description) {
    const newEntry = {
        id: entries.length + 1,
        type,
        title,
        content: { description },
        links: [],
        backlinks: []
    };
    entries.push(newEntry);
    saveEntries();
}

// Create a bi-directional link
function createLink(fromId, toId, label) {
    const fromEntry = entries.find(e => e.id === fromId);
    const toEntry = entries.find(e => e.id === toId);
    if (fromEntry && toEntry) {
        fromEntry.links.push({ toId, label });
        toEntry.backlinks.push({ fromId, label });
        saveEntries();
    }
}