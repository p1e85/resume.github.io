// js/classes/KeyboardShortcuts.js
export class KeyboardShortcuts {
    constructor(tabManager, menuBar) {
        this.tabManager = tabManager;
        this.menuBar = menuBar;
        this.setup();
    }

    setup() {
        document.addEventListener('keydown', (e) => {
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
                        alert("🔍 Find/Replace - Full dialog coming in future update");
                        break;
                }
            }

            // F5 = Time/Date (classic Notepad style)
            if (e.key === 'F5') {
                e.preventDefault();
                this.menuBar.insertTimeDate();
            }
        });
    }
}
