// js/classes/DialogManager.js
// Handles Amiga-style requester dialogs

export class DialogManager {
    showAboutDialog() {
        const aboutHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                        background: #c0c0c0; border: 4px solid #fff; border-right-color: #808080; border-bottom-color: #808080;
                        padding: 20px; width: 380px; font-family: monospace; box-shadow: 4px 4px 0 #00000080; z-index: 1000;">
                <div style="background: #0000aa; color: white; padding: 4px; text-align: center; margin-bottom: 12px;">
                    About Amiga Pad
                </div>
                <p><strong>Amiga Pad v0.1</strong></p>
                <p>A retro multi-tab notepad inspired by Amiga Workbench 1.3 and Windows Notepad.</p>
                <p>Coded with Grok by xAI</p>
                <p style="margin-top: 20px; text-align: center;">
                    <button onclick="this.closest('.dialog-overlay').remove()" style="padding: 4px 12px;">OK</button>
                </p>
            </div>
            <div class="dialog-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 999;"></div>
        `;

        const div = document.createElement('div');
        div.innerHTML = aboutHTML;
        document.body.appendChild(div);
    }

    // Placeholder for future unsaved changes dialog, Find dialog, etc.
    showUnsavedDialog(noteTitle, onSave, onDiscard, onCancel) {
        if (confirm(`Save changes to ${noteTitle}?`)) {
            onSave();
        } else {
            onDiscard();
        }
    }
}
