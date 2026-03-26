// js/main.js
import { StorageManager } from './classes/StorageManager.js';
import { ThemeManager } from './classes/ThemeManager.js';
import { Note } from './classes/Note.js';
import { TabManager } from './classes/TabManager.js';
import { MenuBar } from './classes/MenuBar.js';
import { DialogManager } from './classes/DialogManager.js';
import { WindowManager } from './classes/WindowManager.js';
import { KeyboardShortcuts } from './classes/KeyboardShortcuts.js';

class AmigaPad {
    constructor() {
        this.themeManager = new ThemeManager();
        this.themeManager.loadSavedTheme();

        this.dialogManager = new DialogManager();

        this.initUI();
        
        this.tabManager = new TabManager('tab-bar', 'editor-container', this.onTabChange.bind(this));
        this.tabManager.dialogManager = this.dialogManager;   // Required for unsaved dialog

        this.windowManager = new WindowManager();
        
        this.menuBar = new MenuBar(
            this.tabManager,
            this.themeManager,
            this.dialogManager,
            this.windowManager
        );

        this.keyboardShortcuts = new KeyboardShortcuts(this.tabManager, this.menuBar);
        this.tabManager.startAutoSave(30000);

        this.loadLastSession();
        this.createInitialTab();
    }

    initUI() {
        const app = document.getElementById('app');
        app.classList.add('workbench-mode'); // Start in Workbench mode

        app.innerHTML = `
            <div class="amiga-window amiga-bevel-raised" id="main-window">
                <!-- Title Bar -->
                <div class="amiga-title-bar" id="title-bar">
                    <div class="amiga-close-gadget" id="close-gadget"></div>
                    <div style="flex: 1; text-align: center; font-size: 15px;">Amiga Pad</div>
                </div>

                <!-- Menu Bar -->
                <div class="amiga-menu-bar" id="menu-bar"></div>

                <!-- Tab Bar -->
                <div class="amiga-tab-bar" id="tab-bar"></div>

                <!-- Editor Area -->
                <div class="amiga-editor-container amiga-bevel-inset" id="editor-container"></div>

                <!-- Status Bar -->
                <div class="amiga-status-bar amiga-bevel-raised" id="status-bar">
                    <span id="status-left">Ln 1, Col 1</span>
                    <span id="status-right">0 chars</span>
                </div>
            </div>
        `;

        // Close gadget
        document.getElementById('close-gadget').addEventListener('click', () => {
            if (confirm('Close Amiga Pad?')) {
                window.close();
            }
        });

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
            const rect = windowEl.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
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
        // Can be expanded later for status or other features
        console.log('Active tab changed:', activeNote ? activeNote.getDisplayTitle() : 'none');
    }

    createInitialTab() {
        const note = new Note("Welcome to Amiga Pad");
        note.content = "Welcome to Amiga Pad!\n\nA faithful recreation with Amiga Workbench 1.3 styling.\n\nStart typing to see the * modified indicator.\n\nEnjoy the retro vibes! 🚀";
        this.tabManager.addTab(note);
    }

    loadLastSession() {
        const saved = StorageManager.loadLastSession();
        if (saved && saved.length > 0) {
            this.tabManager.loadTabsFromData(saved);
        }
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    window.amigaPad = new AmigaPad();
});
