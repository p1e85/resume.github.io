// js/classes/TabManager.js
// Manages tabs, rendering, switching, and basic drag & drop

import { Note } from './Note.js';

export class TabManager {
    constructor(containerId, editorContainerId, onTabChangeCallback) {
        this.tabs = [];
        this.activeTabId = null;
        this.tabContainer = document.getElementById(containerId);
        this.editorContainer = document.getElementById(editorContainerId);
        this.onTabChange = onTabChangeCallback || (() => {});
        
        this.wordWrap = true;
        this.autoSaveTimer = null;
        this.dialogManager = null;        // ← Will be set from main.js
        
        this.setupDragAndDrop();
    }

    addTab(note) {
        this.tabs.push(note);
        if (!this.activeTabId) this.activeTabId = note.id;
        this.renderTabs();
        this.switchToTab(note.id);
    }

    switchToTab(tabId) {
        this.activeTabId = tabId;
        this.renderTabs();
        this.renderCurrentEditor();
        this.onTabChange(this.getActiveNote());
    }

    getActiveNote() {
        return this.tabs.find(t => t.id === this.activeTabId);
    }

    renderTabs() {
        this.tabContainer.innerHTML = '';
        
        this.tabs.forEach(note => {
            const tabEl = document.createElement('div');
            tabEl.className = `amiga-tab ${note.id === this.activeTabId ? 'active' : ''}`;
            tabEl.textContent = note.getDisplayTitle();
            tabEl.dataset.tabId = note.id;
            
            tabEl.addEventListener('click', () => this.switchToTab(note.id));
            
            const closeBtn = document.createElement('span');
            closeBtn.textContent = ' ×';
            closeBtn.style.marginLeft = '10px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.opacity = '0.8';
            closeBtn.style.fontSize = '18px';
            closeBtn.addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                this.closeTab(note.id);
            });
            
            tabEl.appendChild(closeBtn);
            this.tabContainer.appendChild(tabEl);
        });

        // + New Tab button
        const newTabBtn = document.createElement('div');
        newTabBtn.className = 'amiga-tab';
        newTabBtn.textContent = '+';
        newTabBtn.style.fontWeight = 'bold';
        newTabBtn.style.padding = '6px 18px';
        newTabBtn.style.minWidth = '40px';
        newTabBtn.style.textAlign = 'center';
        newTabBtn.addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            this.addNewEmptyTab();
        });
        this.tabContainer.appendChild(newTabBtn);
    }

    toggleWordWrap() {
        this.wordWrap = !this.wordWrap;
        const textarea = this.editorContainer.querySelector('textarea');
        if (textarea) {
            textarea.style.whiteSpace = this.wordWrap ? 'pre-wrap' : 'pre';
            textarea.style.overflowWrap = this.wordWrap ? 'break-word' : 'normal';
        }
    }

    renderCurrentEditor() {
        const activeNote = this.getActiveNote();
        if (!activeNote || !this.editorContainer) return;

        let textarea = this.editorContainer.querySelector('textarea');
        if (!textarea) {
            textarea = document.createElement('textarea');
            this.editorContainer.appendChild(textarea);
            textarea.style.fontSize = '16px';

            textarea.addEventListener('input', () => {
                activeNote.updateContent(textarea.value);
                this.renderTabs();
                this.updateStatusBar();
            });

            textarea.addEventListener('keyup', () => this.updateStatusBar());
            textarea.addEventListener('click', () => this.updateStatusBar());
            textarea.addEventListener('select', () => this.updateStatusBar());
        }
        
        textarea.value = activeNote.content;
        setTimeout(() => this.updateStatusBar(), 50);
    }

    updateStatusBar() {
        const textarea = this.editorContainer.querySelector('textarea');
        if (!textarea) return;

        const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length;
        const currentCol = lines[lines.length - 1].length + 1;

        const statusLeft = document.getElementById('status-left');
        const statusRight = document.getElementById('status-right');

        if (statusLeft) statusLeft.textContent = `Ln ${currentLine}, Col ${currentCol}`;
        if (statusRight) statusRight.textContent = `${textarea.value.length} chars`;
    }

    addNewEmptyTab() {
        const newNote = new Note(`Untitled-${this.tabs.length + 1}`);
        this.addTab(newNote);
    }

    closeTab(tabId) {
        const note = this.tabs.find(t => t.id === tabId);
        if (!note) return;

        if (note.modified) {
            if (!this.dialogManager) {
                // Fallback if dialogManager not set yet
                if (confirm(`Save changes to "${note.getDisplayTitle()}" before closing?`)) {
                    note.markSaved();
                }
                this.performClose(tabId);
                return;
            }

            this.dialogManager.showUnsavedDialog(
                note.getDisplayTitle(),
                () => {
                    note.markSaved();
                    this.performClose(tabId);
                },
                () => this.performClose(tabId)
            );
            return;
        }

        this.performClose(tabId);
    }

    performClose(tabId) {
        this.tabs = this.tabs.filter(t => t.id !== tabId);
        
        if (this.activeTabId === tabId) {
            this.activeTabId = this.tabs.length ? this.tabs[this.tabs.length - 1].id : null;
        }
        
        this.renderTabs();
        if (this.activeTabId) this.renderCurrentEditor();
    }

    setupDragAndDrop() {
        this.tabContainer.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('amiga-tab')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.tabId);
            }
        });
        
        this.tabContainer.addEventListener('dragover', (e) => e.preventDefault());
        this.tabContainer.addEventListener('drop', (e) => e.preventDefault());
    }

    getAllTabsData() {
        return this.tabs.map(note => note.toJSON());
    }

    loadTabsFromData(dataArray) {
        this.tabs = dataArray.map(data => Note.fromJSON(data));
        if (this.tabs.length > 0) {
            this.activeTabId = this.tabs[0].id;
        }
        this.renderTabs();
        this.renderCurrentEditor();
    }

    startAutoSave(intervalMs = 30000) {
        if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
        
        this.autoSaveTimer = setInterval(() => {
            const active = this.getActiveNote();
            if (active && active.modified) {
                active.markSaved(active.filename);
                this.renderTabs();
                console.log(`💾 Auto-saved: ${active.getDisplayTitle()}`);
            }
        }, intervalMs);
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
}
