// js/classes/MenuBar.js
// Builds and handles the Amiga-style menu bar

import { StorageManager } from './StorageManager.js';

export class MenuBar {
    constructor(tabManager, themeManager, dialogManager) {
        this.tabManager = tabManager;
        this.themeManager = themeManager;
        this.dialogManager = dialogManager;
        this.menuContainer = document.getElementById('menu-bar');
        this.buildMenu();
    }

    buildMenu() {
        this.menuContainer.innerHTML = `
            <div class="amiga-menu-bar-inner" style="display: flex; gap: 20px; padding: 2px 8px; font-weight: bold;">
                <span class="menu-item" data-menu="file">File</span>
                <span class="menu-item" data-menu="edit">Edit</span>
                <span class="menu-item" data-menu="format">Format</span>
                <span class="menu-item" data-menu="view">View</span>
                <span class="menu-item" data-menu="help">Help</span>
            </div>
        `;

        // Simple click handler for now (we'll expand to full dropdowns later if needed)
        this.menuContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.menu-item');
            if (!item) return;

            const menuType = item.dataset.menu;
            this.handleMenuClick(menuType);
        });
    }

    handleMenuClick(menuType) {
        switch (menuType) {
            case 'file':
                this.showFileMenu();
                break;
            case 'edit':
                this.showEditMenu();
                break;
            case 'format':
                alert("Format menu coming soon (Word Wrap, Font...)");
                break;
            case 'view':
                this.showViewMenu();
                break;
            case 'help':
                this.showHelpMenu();
                break;
        }
    }

    showFileMenu() {
        const choice = prompt(
            "File Menu:\n\n" +
            "1. New\n" +
            "2. Open...\n" +
            "3. Save\n" +
            "4. Save As...\n" +
            "5. Recent Files\n" +
            "6. Save Session\n" +
            "7. Load Session\n\n" +
            "Enter number:"
        );

        if (!choice) return;

        switch (choice.trim()) {
            case '1':
                this.tabManager.addNewEmptyTab();
                break;
            case '2':
                this.openFile();
                break;
            case '3':
                this.saveCurrentFile();
                break;
            case '4':
                this.saveAsCurrentFile();
                break;
            case '5':
                this.showRecentFiles();
                break;
            case '6':
                this.saveSession();
                break;
            case '7':
                this.loadSession();
                break;
        }
    }

    showEditMenu() {
        alert("Edit menu:\nUndo, Cut, Copy, Paste, Delete, Find, Replace, Go To, Select All, Time/Date\n\nMost will be implemented soon.");
    }

    showViewMenu() {
        if (confirm("Toggle Dark / Light Theme?\n(Workbench 1.3 Light is default)")) {
            this.themeManager.toggle();
        }
    }

    showHelpMenu() {
        this.dialogManager.showAboutDialog();
    }

    // File operations
    async openFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const content = await file.text();
                const newNote = new Note(file.name.replace('.txt', ''), content); // Note class needs import
                this.tabManager.addTab(newNote);
                StorageManager.addRecentFile(file.name);
            } catch (err) {
                alert("Failed to open file: " + err.message);
            }
        };
        
        input.click();
    }

    saveCurrentFile() {
        const activeNote = this.tabManager.getActiveNote();
        if (!activeNote) return;
        
        if (activeNote.filename) {
            this.downloadFile(activeNote.filename, activeNote.content);
            activeNote.markSaved();
            this.tabManager.renderTabs();
        } else {
            this.saveAsCurrentFile();
        }
    }

    saveAsCurrentFile() {
        const activeNote = this.tabManager.getActiveNote();
        if (!activeNote) return;
        
        const defaultName = activeNote.filename || `amigapad-${Date.now().toString().slice(-4)}.txt`;
        const filename = prompt("Save as:", defaultName);
        
        if (filename) {
            this.downloadFile(filename, activeNote.content);
            activeNote.markSaved(filename);
            this.tabManager.renderTabs();
            StorageManager.addRecentFile(filename);
        }
    }

    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.txt') ? filename : filename + '.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    showRecentFiles() {
        const recent = StorageManager.getRecentFiles();
        if (recent.length === 0) {
            alert("No recent files yet.");
            return;
        }
        const list = recent.map((f, i) => `${i+1}. ${f}`).join('\n');
        alert("Recent Files:\n" + list + "\n\n(Loading not yet implemented)");
    }

    saveSession() {
        const data = this.tabManager.getAllTabsData();
        if (data.length === 0) return;
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `amigapad-session-${new Date().toISOString().slice(0,10)}.amigapad`;
        a.click();
        URL.revokeObjectURL(url);
        
        StorageManager.saveLastSession(data);
        alert("Session saved!");
    }

    async loadSession() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.amigapad';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                this.tabManager.loadTabsFromData(data);
                StorageManager.saveLastSession(data);
                alert("Session loaded successfully!");
            } catch (err) {
                alert("Failed to load session: " + err.message);
            }
        };
        
        input.click();
    }
}
