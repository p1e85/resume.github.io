// js/classes/WindowManager.js
export class WindowManager {
    constructor() {
        this.isWorkbenchMode = true; // default on desktop
        this.applyMode();
        this.detectScreenSize();
    }

    toggleMode() {
        this.isWorkbenchMode = !this.isWorkbenchMode;
        this.applyMode();
        // Could save preference to StorageManager later
    }

    applyMode() {
        const app = document.getElementById('app');
        if (this.isWorkbenchMode) {
            app.classList.add('workbench-mode');
            app.classList.remove('classic-mode');
        } else {
            app.classList.add('classic-mode');
            app.classList.remove('workbench-mode');
        }
    }

    detectScreenSize() {
        if (window.innerWidth < 768) {
            this.isWorkbenchMode = false; // force classic on mobile
            this.applyMode();
        }
    }
}
