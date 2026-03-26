// js/classes/ThemeManager.js
// Manages Light (Workbench 1.3) vs Dark theme

import { StorageManager } from './StorageManager.js';

export class ThemeManager {
    constructor() {
        this.isDark = false;
        this.loadSavedTheme();
    }

    toggle() {
        this.isDark = !this.isDark;
        StorageManager.saveTheme(this.isDark);
        this.applyTheme();
    }

    applyTheme() {
        const root = document.documentElement;
        
        if (this.isDark) {
            root.classList.add('dark-theme');
        } else {
            root.classList.remove('dark-theme');
        }
        
        console.log(`Amiga Pad theme: ${this.isDark ? 'Dark' : 'Workbench 1.3 Light'}`);
    }

    loadSavedTheme() {
        this.isDark = StorageManager.loadTheme();
        this.applyTheme();
    }
}
