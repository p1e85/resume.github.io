// js/classes/DialogManager.js
export class DialogManager {
    showAboutDialog() {
        this.createDialog(
            "About Amiga Pad",
            `
                <p><strong>Amiga Pad v0.4</strong></p>
                <p>A retro multi-tab notepad inspired by Amiga Workbench 1.3 and Windows Notepad.</p>
                <p>Coded with Grok by xAI</p>
                <p style="margin-top: 15px; font-size: 13px;">Enjoy the classic vibes!</p>
            `,
            "OK"
        );
    }

    showHelpDialog() {
        this.createDialog(
            "How to Use Amiga Pad",
            `
                <strong>Basic Controls:</strong><br><br>
                • <strong>Ctrl + N</strong> — New tab<br>
                • <strong>Ctrl + O</strong> — Open .txt file<br>
                • <strong>Ctrl + S</strong> — Save current tab<br>
                • <strong>Ctrl + Shift + S</strong> — Save As...<br>
                • <strong>F5</strong> — Insert current time/date<br><br>
                
                <strong>Tabs &amp; Editor:</strong><br>
                • Click the <strong>+</strong> button to add a new tab<br>
                • The <strong>*</strong> means unsaved changes<br>
                • Word Wrap is in Format menu<br>
                • Auto-save runs every 30 seconds
            `,
            "OK"
        );
    }

    showFAQsDialog() {
        this.createDialog(
            "Amiga Pad - FAQs",
            `
                <strong>Common Questions:</strong><br><br>
                <strong>Q:</strong> Menus sometimes don't open on first click?<br>
                <strong>A:</strong> This is a known quirk. Clicking in the editor usually fixes it.<br><br>
                <strong>Q:</strong> How do I save permanently?<br>
                <strong>A:</strong> Use Save / Save As or Save Session.<br><br>
                <strong>Q:</strong> Works on mobile?<br>
                <strong>A:</strong> Yes — switch to Classic Mode in View menu.<br><br>
                <strong>Q:</strong> Tabs remembered on reload?<br>
                <strong>A:</strong> Yes, last session is restored automatically.
            `,
            "OK"
        );
    }

    showRecentFilesDialog(recentFiles, onSelect) {
        let content = "<strong>Recent Files</strong><br><br>";
        if (recentFiles.length === 0) {
            content += "No recent files yet.";
        } else {
            recentFiles.forEach((file, i) => {
                content += `${i+1}. <span style="cursor:pointer;color:#0000aa;" onclick="window.amigaPad.selectRecentFile('${file}')">${file}</span><br>`;
            });
        }

        this.createDialog(
            "Recent Files",
            content,
            "OK"
        );
    }

    showUnsavedDialog(noteTitle, onSave, onDiscard) {
        this.createDialog(
            "Amiga Pad",
            `<p>Save changes to <strong>${noteTitle}</strong>?</p>`,
            "Yes", "No", "Cancel",
            (choice) => {
                if (choice === "Yes") onSave?.();
                else if (choice === "No") onDiscard?.();
            }
        );
    }

    createDialog(title, contentHTML, ...buttons) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: var(--amiga-window-bg, #c0c0c0);
            border: 4px solid;
            border-color: var(--bevel-light, #ffffff) var(--bevel-dark, #808080) var(--bevel-dark, #808080) var(--bevel-light, #ffffff);
            padding: 20px; width: 420px; max-width: 92%;
            box-shadow: 8px 8px 0 rgba(0,0,0,0.7); z-index: 10000;
            font-family: monospace; font-size: 15px; color: var(--amiga-text, #000000);
        `;

        const buttonHTML = buttons.map(btnText => `
            <button class="dialog-btn" data-choice="${btnText}" 
                    style="padding: 8px 24px; margin: 4px; min-width: 90px; font-family: monospace; cursor: pointer;">
                ${btnText}
            </button>
        `).join('');

        dialog.innerHTML = `
            <div style="background: var(--amiga-title-active, #0000aa); color: var(--amiga-title-text, #ffffff); 
                        padding: 8px 12px; margin-bottom: 18px; text-align: center; font-weight: bold;">
                ${title}
            </div>
            <div style="margin-bottom: 28px; line-height: 1.6;">
                ${contentHTML}
            </div>
            <div style="text-align: center; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                ${buttonHTML}
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.style.cssText = `position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 9999;`;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        const closeDialog = () => {
            dialog.remove();
            overlay.remove();
        };

        dialog.querySelectorAll('.dialog-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const choice = btn.dataset.choice;
                const callback = dialog.onChoice;
                if (callback) callback(choice);
                closeDialog();
            });
        });

        dialog.onChoice = buttons.length > 1 ? arguments[3] : null;

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeDialog();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
}
