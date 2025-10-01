document.addEventListener('DOMContentLoaded', () => {
    const entryList = document.getElementById('entry-list');
    const entryForm = document.getElementById('entry-form');
    const linkForm = document.getElementById('link-form');
    const fromEntry = document.getElementById('from-entry');
    const toEntry = document.getElementById('to-entry');

    // Render entries
    function renderEntries() {
        entryList.innerHTML = '';
        entries.forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${entry.title} (${entry.type}): ${entry.content.description}
                <br>Links: ${entry.links.map(link => `${link.label} to ${entries.find(e => e.id === link.toId)?.title}`).join(', ') || 'None'}
                <br>Backlinks: ${entry.backlinks.map(link => `${link.label} from ${entries.find(e => e.id === link.fromId)?.title}`).join(', ') || 'None'}
            `;
            entryList.appendChild(li);
        });

        // Populate link form dropdowns
        fromEntry.innerHTML = toEntry.innerHTML = entries.map(entry => 
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

    renderEntries();
});