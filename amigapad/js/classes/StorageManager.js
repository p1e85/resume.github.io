// js/classes/StorageManager.js
// Handles all localStorage operations for Amiga Pad

export class StorageManager {
    static KEYS = {
        THEME: 'amigapad_theme',
        TABS: 'amigapad_tabs',
        RECENT_FILES: 'amigapad_recent',
        SETTINGS: 'amigapad_settings',
        LAST_SESSION: 'amigapad_last_session'
    };

    // Save any value
    static save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Storage save failed:', e);
            return false;
        }
    }

    // Load any value with default
    static load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Storage load failed:', e);
            return defaultValue;
        }
    }

    // Theme
    static saveTheme(isDark) {
        this.save(this.KEYS.THEME, isDark);
    }

    static loadTheme() {
        return this.load(this.KEYS.THEME, false); // false = light by default
    }

    // Tabs / Session
    static saveTabs(tabsData) {
        this.save(this.KEYS.TABS, tabsData);
    }

    static loadTabs() {
        return this.load(this.KEYS.TABS, []);
    }

    // Recent files (max 5)
    static addRecentFile(filename) {
        let recent = this.load(this.KEYS.RECENT_FILES, []);
        // Remove if already exists
        recent = recent.filter(f => f !== filename);
        recent.unshift(filename); // Add to front
        if (recent.length > 5) recent.pop(); // Keep max 5
        this.save(this.KEYS.RECENT_FILES, recent);
        return recent;
    }

    static getRecentFiles() {
        return this.load(this.KEYS.RECENT_FILES, []);
    }

    // Full session save (for Save Session feature later)
    static saveLastSession(tabsData) {
        this.save(this.KEYS.LAST_SESSION, tabsData);
    }

    static loadLastSession() {
        return this.load(this.KEYS.LAST_SESSION, []);
    }

    // Clear everything (useful for testing)
    static clearAll() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
    }
}
