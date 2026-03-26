// js/classes/KeyboardShortcuts.js
export class KeyboardShortcuts {
    constructor(tabManager, menuBar) {
        this.tabManager = tabManager;
        this.menuBar = menuBar;
        this.setup();
    }

    setup() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd key combinations
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'n':
                        e.preventDefault();
                        this.tabManager.addNewEmptyTab();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.menuBar.openFile();
                        break;
                    case 's':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.menuBar.saveAsCurrentFile();
                        } else {
                            this.menuBar.saveCurrentFile();
                        }
                        break;
                    case 'f':
                        e.preventDefault();
                        alert("Find & Replace - coming in next update");
                        break;
                }
            }

            // F5 for Time/Date (classic Notepad behavior)
            if (e.key === 'F5') {
                e.preventDefault();
                this.menuBar.insertTimeDate();
            }
        });
    }
}
