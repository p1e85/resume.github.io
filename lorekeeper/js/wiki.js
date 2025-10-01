document.addEventListener('DOMContentLoaded', () => {
    const entryList = document.getElementById('entry-list');
    const entryForm = document.getElementById('entry-form');
    const linkForm = document.getElementById('link-form');
    const fromEntry = document.getElementById('from-entry');
    const toEntry = document.getElementById('to-entry');
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');
    const importMessage = document.getElementById('import-message');

    // Render entries
    function renderEntries() {
        entryList.innerHTML = '';
        if (lorekeeperData.entries.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No entries yet. Add one above!';
            entryList.appendChild(li);
        } else {
            lorekeeperData.entries.forEach(entry => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${entry.title} (${entry.type}): ${entry.content.description}
                    <br>Links: ${entry.links.map(link => `${link.label} to ${lorekeeperData.entries.find(e => e.id === link.toId)?.title || 'Unknown'}`).join(', ') || 'None'}
                    <br>Backlinks: ${entry.backlinks.map(link => `${link.label} from ${lorekeeperData.entries.find(e => e.id === link.fromId)?.title || 'Unknown'}`).join(', ') || 'None'}
                `;
                entryList.appendChild(li);
            });
        }

        // Populate link form dropdowns
        fromEntry.innerHTML = toEntry.innerHTML = lorekeeperData.entries.length === 0 
            ? '<option value="">No entries available</option>'
            : lorekeeperData.entries.map(entry => 
                `<option value="${entry.id}">${entry.title}</option>`
            ).join('');
    }

    // Handle entry form submission
    entryForm.addEventListener('submit', e => {
        e.preventDefault();
        const type = document.getElementById('entry-type').value;
        const title = document.getElementById('entry-title').value;
        const description = document.getElementById('entry-description').value;
        addEntry(type, title, description);
        renderEntries();
        entryForm.reset();
    });

    // Handle link form submission
    linkForm.addEventListener('submit', e => {
        e.preventDefault();
        const fromId = parseInt(fromEntry.value);
        const toId = parseInt(toEntry.value);
        const label = document.getElementById('link-label').value || 'related';
        createLink(fromId, toId, label);
        renderEntries();
        linkForm.reset();
    });

    // Handle export
    exportBtn.addEventListener('click', () => {
        exportData();
    });

    // Handle import
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importData(file, (success, error) => {
                importMessage.style.display = 'block';
                if (success) {
                    importMessage.style.color = '#f4e4a7';
                    importMessage.textContent = 'Data imported successfully!';
                    renderEntries();
                } else {
                    importMessage.style.color = 'red';
                    importMessage.textContent = error || 'Failed to import data.';
                }
                setTimeout(() => { importMessage.style.display = 'none'; }, 3000);
                importFile.value = '';
            });
        }
    });

    renderEntries();
});
