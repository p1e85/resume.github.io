// js/classes/ThemeManager.js
// Manages Light (Workbench 1.3) vs Dark theme

export class ThemeManager {
    constructor() {
        this.isDark = false;
        this.applyTheme();
    }

    toggle() {
        this.isDark = !this.isDark;
        StorageManager.saveTheme(this.isDark); // We'll import StorageManager later
        this.applyTheme();
    }

    applyTheme() {
        const root = document.documentElement;
        
        if (this.isDark) {
            root.classList.add('dark-theme');
        } else {
            root.classList.remove('dark-theme');
        }
        
        // Future: could dispatch a custom event for other components to react
        console.log(`Amiga Pad theme: ${this.isDark ? 'Dark' : 'Workbench 1.3 Light'}`);
    }

    loadSavedTheme() {
        this.isDark = StorageManager.loadTheme();
        this.applyTheme();
    }
}
