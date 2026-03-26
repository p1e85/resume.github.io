// js/main.js
import { StorageManager } from './classes/StorageManager.js';
import { ThemeManager } from './classes/ThemeManager.js';
import { Note } from './classes/Note.js';
import { TabManager } from './classes/TabManager.js';

class AmigaPad {
    constructor() {
        this.themeManager = new ThemeManager();
        this.themeManager.loadSavedTheme();

        this.initUI();
        this.tabManager = new TabManager('tab-bar', 'editor-container', this.onTabChange.bind(this));
        
        this.loadLastSession();
        this.createInitialTab();
    }

    initUI() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- Amiga Desktop / Window Container -->
            <div class="amiga-window amiga-bevel-raised" id="main-window">
                
                <!-- Title Bar -->
                <div class="amiga-title-bar" id="title-bar">
                    <div class="amiga-close-gadget" id="close-gadget"></div>
                    <div style="flex: 1; text-align: center;">Amiga Pad</div>
                </div>

                <!-- Menu Bar (placeholder for now) -->
                <div class="amiga-menu-bar amiga-bevel-raised" id="menu-bar">
                    File Edit Format View Help
                </div>

                <!-- Tab Bar -->
                <div class="amiga-tab-bar" id="tab-bar"></div>

                <!-- Editor Area -->
                <div class="amiga-editor-container amiga-bevel-inset" id="editor-container" style="flex: 1; min-height: 300px;"></div>

                <!-- Status Bar -->
                <div class="amiga-status-bar amiga-bevel-raised" id="status-bar">
                    <span>Line 1, Col 1</span>
                    <span>100% | Ln 1, Col 1</span>
                </div>
            </div>
        `;

        // Close gadget (for now just alerts)
        document.getElementById('close-gadget').addEventListener('click', () => {
            if (confirm('Close Amiga Pad?')) {
                window.close(); // or do nothing in browser
            }
        });

        // Make title bar draggable (basic)
        this.makeDraggable();
    }

    makeDraggable() {
        const titleBar = document.getElementById('title-bar');
        const windowEl = document.getElementById('main-window');
        let isDragging = false;
        let offsetX, offsetY;

        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.id === 'close-gadget') return;
            isDragging = true;
            offsetX = e.clientX - windowEl.offsetLeft;
            offsetY = e.clientY - windowEl.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            windowEl.style.position = 'absolute';
            windowEl.style.left = (e.clientX - offsetX) + 'px';
            windowEl.style.top = (e.clientY - offsetY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    onTabChange(activeNote) {
        // Will be used later for status bar, menu state, etc.
        console.log('Active tab changed:', activeNote ? activeNote.getDisplayTitle() : 'none');
    }

    createInitialTab() {
        const initialNote = new Note("Welcome to Amiga Pad");
        initialNote.content = "Welcome to Amiga Pad!\n\nA retro-styled multi-tab notepad inspired by Workbench 1.3.\n\nStart typing...";
        this.tabManager.addTab(initialNote);
    }

    loadLastSession() {
        const savedTabs = StorageManager.loadLastSession();
        if (savedTabs && savedTabs.length > 0) {
            this.tabManager.loadTabsFromData(savedTabs);
        }
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    window.amigaPad = new AmigaPad();
});
