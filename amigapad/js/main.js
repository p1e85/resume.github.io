// js/main.js
import { StorageManager } from './classes/StorageManager.js';
import { ThemeManager } from './classes/ThemeManager.js';
import { Note } from './classes/Note.js';
import { TabManager } from './classes/TabManager.js';
import { MenuBar } from './classes/MenuBar.js';
import { DialogManager } from './classes/DialogManager.js';

class AmigaPad {
    constructor() {
        this.themeManager = new ThemeManager();
        this.themeManager.loadSavedTheme();

        this.dialogManager = new DialogManager();

        this.initUI();
        
        this.tabManager = new TabManager('tab-bar', 'editor-container', this.onTabChange.bind(this));
        
        this.menuBar = new MenuBar(this.tabManager, this.themeManager, this.dialogManager);

        this.loadLastSession();
        this.createInitialTab();
    }

    initUI() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="amiga-window amiga-bevel-raised" id="main-window">
                <!-- Title Bar -->
                <div class="amiga-title-bar" id="title-bar">
                    <div class="amiga-close-gadget" id="close-gadget"></div>
                    <div style="flex: 1; text-align: center;">Amiga Pad</div>
                </div>

                <!-- Menu Bar -->
                <div class="amiga-menu-bar" id="menu-bar"></div>

                <!-- Tab Bar -->
                <div class="amiga-tab-bar" id="tab-bar"></div>

                <!-- Editor -->
                <div class="amiga-editor-container amiga-bevel-inset" id="editor-container" style="flex: 1;"></div>

                <!-- Status Bar -->
                <div class="amiga-status-bar amiga-bevel-raised" id="status-bar">
                    <span id="status-left">Line 1, Col 1</span>
                    <span id="status-right">100%</span>
                </div>
            </div>
        `;

        document.getElementById('close-gadget').addEventListener('click', () => {
            if (confirm('Close Amiga Pad? Unsaved changes will be lost.')) {
                // In real app we could save session first
                window.close();
            }
        });

        this.makeDraggable();
    }

    makeDraggable() { /* keep the same draggable code from previous version */ 
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

        document.addEventListener('mouseup', () => isDragging = false);
    }

    onTabChange(activeNote) {
        console.log('Tab changed:', activeNote?.getDisplayTitle());
    }

    createInitialTab() {
        const note = new Note("Welcome to Amiga Pad");
        note.content = "Welcome to Amiga Pad!\n\nThis is a faithful recreation of a classic notepad with Amiga Workbench 1.3 styling.\n\nEnjoy the retro vibes! 🚀";
        this.tabManager.addTab(note);
    }

    loadLastSession() {
        const saved = StorageManager.loadLastSession();
        if (saved && saved.length > 0) {
            this.tabManager.loadTabsFromData(saved);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.amigaPad = new AmigaPad();
});
