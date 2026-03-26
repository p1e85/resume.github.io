// js/classes/MenuBar.js
import { StorageManager } from './StorageManager.js';
import { Note } from './Note.js';

export class MenuBar {
    constructor(tabManager, themeManager, dialogManager) {
        this.tabManager = tabManager;
        this.themeManager = themeManager;
        this.dialogManager = dialogManager;
        this.menuContainer = document.getElementById('menu-bar');
        this.currentOpenMenu = null;
        this.buildMenu();
    }

    buildMenu() {
        this.menuContainer.innerHTML = `
            <div class="amiga-menu-bar-inner" style="display: flex; gap: 20px; padding: 3px 8px; user-select: none;">
                <span class="menu-item" data-menu="file">File</span>
                <span class="menu-item" data-menu="edit">Edit</span>
                <span class="menu-item" data-menu="format">Format</span>
                <span class="menu-item" data-menu="view">View</span>
                <span class="menu-item" data-menu="help">Help</span>
            </div>
        `;

        this.menuContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.menu-item');
            if (item) this.toggleMenu(item.dataset.menu);
        });
    }

    toggleMenu(menuType) {
        // Close any open menu first
        if (this.currentOpenMenu) this.currentOpenMenu.remove();

        const rect = this.menuContainer.getBoundingClientRect();
        const menuEl = document.createElement('div');
        menuEl.className = 'amiga-dropdown-menu';
        menuEl.style.position = 'absolute';
        menuEl.style.left = `${rect.left + 10}px`;
        menuEl.style.top = `${rect.bottom + 2}px`;
        menuEl.style.background = 'var(--amiga-window-bg)';
        menuEl.style.border = '2px solid';
        menuEl.style.borderColor = 'var(--bevel-light) var(--bevel-dark) var(--bevel-dark) var(--bevel-light)';
        menuEl.style.padding = '4px 0';
        menuEl.style.minWidth = '180px';
        menuEl.style.boxShadow = '4px 4px 0 #00000080';
        menuEl.style.zIndex = '1000';

        let items = [];

        if (menuType === 'file') {
            items = [
                { label: 'New', action: () => this.tabManager.addNewEmptyTab() },
                { label: 'Open...', action: () => this.openFile() },
                { label: 'Save', action: () => this.saveCurrentFile() },
                { label: 'Save As...', action: () => this.saveAsCurrentFile() },
                { label: '---' },
                { label: 'Recent Files', action: () => this.showRecentFiles() },
                { label: '---' },
                { label: 'Save Session', action: () => this.saveSession() },
                { label: 'Load Session', action: () => this.loadSession() }
            ];
        } else if (menuType === 'edit') {
            items = [
                { label: 'Undo', action: () => document.execCommand('undo') },
                { label: 'Cut', action: () => document.execCommand('cut') },
                { label: 'Copy', action: () => document.execCommand('copy') },
                { label: 'Paste', action: () => document.execCommand('paste') },
                { label: 'Delete', action: () => document.execCommand('delete') },
                { label: '---' },
                { label: 'Find...', action: () => alert('Find dialog coming soon') },
                { label: 'Replace...', action: () => alert('Replace coming soon') },
                { label: 'Go To...', action: () => alert('Go To coming soon') },
                { label: 'Select All', action: () => document.execCommand('selectAll') },
                { label: 'Time/Date', action: () => this.insertTimeDate() }
            ];
        } else if (menuType === 'view') {
            items = [
                { label: 'Toggle Theme (Light/Dark)', action: () => this.themeManager.toggle() }
            ];
        } else if (menuType === 'help') {
            items = [
                { label: 'About Amiga Pad', action: () => this.dialogManager.showAboutDialog() }
            ];
        }

        items.forEach(item => {
            if (item.label === '---') {
                const hr = document.createElement('div');
                hr.style.height = '1px';
                hr.style.background = 'var(--bevel-dark)';
                hr.style.margin = '4px 8px';
                menuEl.appendChild(hr);
                return;
            }

            const row = document.createElement('div');
            row.style.padding = '4px 20px';
            row.style.cursor = 'pointer';
            row.textContent = item.label;
            row.addEventListener('click', () => {
                item.action();
                if (this.currentOpenMenu) this.currentOpenMenu.remove();
            });
            row.addEventListener('mouseover', () => row.style.background = '#0000aa');
            row.addEventListener('mouseout', () => row.style.background = '');
            menuEl.appendChild(row);
        });

        document.body.appendChild(menuEl);
        this.currentOpenMenu = menuEl;

        // Close when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this.closeMenu.bind(this), { once: true });
        }, 10);
    }

    closeMenu() {
        if (this.currentOpenMenu) {
            this.currentOpenMenu.remove();
            this.currentOpenMenu = null;
        }
    }

    // File operations (same as before, but cleaner)
    async openFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const content = await file.text();
                const newNote = new Note(file.name.replace(/\.[^/.]+$/, ""), content);
                this.tabManager.addTab(newNote);
                StorageManager.addRecentFile(file.name);
            } catch (err) {
                alert("Failed to open file");
            }
        };
        input.click();
    }

    saveCurrentFile() {
        const active = this.tabManager.getActiveNote();
        if (!active) return;
        if (active.filename) {
            this.downloadFile(active.filename, active.content);
            active.markSaved();
            this.tabManager.renderTabs();
        } else {
            this.saveAsCurrentFile();
        }
    }

    saveAsCurrentFile() {
        const active = this.tabManager.getActiveNote();
        if (!active) return;
        const defaultName = active.filename || `amigapad-${this.tabManager.tabs.indexOf(active) + 1}.txt`;
        const name = prompt("Save file as:", defaultName);
        if (name) {
            this.downloadFile(name, active.content);
            active.markSaved(name);
            this.tabManager.renderTabs();
            StorageManager.addRecentFile(name);
        }
    }

    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename.endsWith('.txt') ? filename : filename + '.txt';
        a.click();
    }

    showRecentFiles() {
        const recent = StorageManager.getRecentFiles();
        if (recent.length === 0) {
            alert("No recent files.");
            return;
        }
        alert("Recent:\n" + recent.map((f,i) => `${i+1}. ${f}`).join('\n'));
    }

    saveSession() {
        const data = this.tabManager.getAllTabsData();
        if (data.length === 0) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `amigapad-session-${new Date().toISOString().slice(0,10)}.amigapad`;
        a.click();
        StorageManager.saveLastSession(data);
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
            } catch (err) {
                alert("Failed to load session");
            }
        };
        input.click();
    }

    insertTimeDate() {
        const activeNote = this.tabManager.getActiveNote();
        if (!activeNote) return;
        const textarea = document.querySelector('#editor-container textarea');
        if (!textarea) return;
        const now = new Date().toLocaleString();
        const start = textarea.selectionStart;
        textarea.setRangeText(now, start, start, 'end');
        activeNote.updateContent(textarea.value);
        this.tabManager.renderTabs();
    }
}
