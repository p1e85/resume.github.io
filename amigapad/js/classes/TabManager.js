// js/classes/TabManager.js
// Manages tabs, rendering, switching, and basic drag & drop

export class TabManager {
    constructor(containerId, editorContainerId, onTabChangeCallback) {
        this.tabs = [];
        this.activeTabId = null;
        this.tabContainer = document.getElementById(containerId);
        this.editorContainer = document.getElementById(editorContainerId);
        this.onTabChange = onTabChangeCallback || (() => {});
        
        this.setupDragAndDrop();
    }

    addTab(note) {
        this.tabs.push(note);
        if (!this.activeTabId) this.activeTabId = note.id;
        this.renderTabs();
        this.switchToTab(note.id);
    }

    switchToTab(tabId) {
        this.activeTabId = tabId;
        this.renderTabs();
        this.renderCurrentEditor();
        this.onTabChange(this.getActiveNote());
    }

    getActiveNote() {
        return this.tabs.find(t => t.id === this.activeTabId);
    }

    renderTabs() {
        this.tabContainer.innerHTML = '';
        
        this.tabs.forEach(note => {
            const tabEl = document.createElement('div');
            tabEl.className = `amiga-tab ${note.id === this.activeTabId ? 'active' : ''}`;
            tabEl.textContent = note.getDisplayTitle();
            tabEl.dataset.tabId = note.id;
            
            // Click to switch
            tabEl.addEventListener('click', () => this.switchToTab(note.id));
            
            // Close button (small Amiga style)
            const closeBtn = document.createElement('span');
            closeBtn.textContent = ' ×';
            closeBtn.style.marginLeft = '8px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.opacity = '0.7';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(note.id);
            });
            
            tabEl.appendChild(closeBtn);
            this.tabContainer.appendChild(tabEl);
        });

        // New Tab button
        const newTabBtn = document.createElement('div');
        newTabBtn.className = 'amiga-tab';
        newTabBtn.textContent = '+';
        newTabBtn.style.fontWeight = 'bold';
        newTabBtn.addEventListener('click', () => this.addNewEmptyTab());
        this.tabContainer.appendChild(newTabBtn);
    }

    renderCurrentEditor() {
        const activeNote = this.getActiveNote();
        if (!activeNote || !this.editorContainer) return;

        let textarea = this.editorContainer.querySelector('textarea');
        if (!textarea) {
            textarea = document.createElement('textarea');
            this.editorContainer.appendChild(textarea);
            
            // Auto-save on input + mark modified
            textarea.addEventListener('input', () => {
                activeNote.updateContent(textarea.value);
                this.renderTabs(); // update * indicator
            });
        }
        
        textarea.value = activeNote.content;
    }

    addNewEmptyTab() {
        const newNote = new Note(`Untitled-${this.tabs.length + 1}`);
        this.addTab(newNote);
    }

    closeTab(tabId) {
        const note = this.tabs.find(t => t.id === tabId);
        if (!note) return;

        if (note.modified) {
            // Use better dialog later – for now keep simple confirm, we'll upgrade next
            if (!confirm(`Save changes to "${note.getDisplayTitle()}" before closing?`)) {
                return;
            }
            // In future we'll call dialogManager.showUnsavedDialog()
        }

        this.tabs = this.tabs.filter(t => t.id !== tabId);
        
        if (this.activeTabId === tabId) {
            this.activeTabId = this.tabs.length ? this.tabs[0].id : null;
        }
        
        this.renderTabs();
        if (this.activeTabId) this.renderCurrentEditor();
    }

    setupDragAndDrop() {
        // Basic drag-to-reorder support (can be enhanced later)
        this.tabContainer.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('amiga-tab')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.tabId);
            }
        });
        
        this.tabContainer.addEventListener('dragover', (e) => e.preventDefault());
        
        this.tabContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData('text/plain');
            // Simple reordering logic can be added here later
        });
    }

    getAllTabsData() {
        return this.tabs.map(note => note.toJSON());
    }

    loadTabsFromData(dataArray) {
        this.tabs = dataArray.map(data => Note.fromJSON(data));
        if (this.tabs.length > 0) {
            this.activeTabId = this.tabs[0].id;
        }
        this.renderTabs();
        this.renderCurrentEditor();
    }
}
