// js/classes/DialogManager.js
export class DialogManager {
    showAboutDialog() {
        this.createDialog(
            "About Amiga Pad",
            `
                <p><strong>Amiga Pad v0.3</strong></p>
                <p>A retro multi-tab notepad inspired by Amiga Workbench 1.3 and Windows Notepad.</p>
                <p>Coded with Grok by xAI</p>
                <p style="margin-top: 15px; font-size: 13px;">Enjoy the classic vibes!</p>
            `,
            "OK"
        );
    }

    showUnsavedDialog(noteTitle, onSave, onDiscard) {
        this.createDialog(
            "Amiga Pad",
            `
                <p>Save changes to <strong>${noteTitle}</strong>?</p>
            `,
            "Yes", "No", "Cancel",
            (choice) => {
                if (choice === "Yes") onSave();
                else if (choice === "No") onDiscard();
                // Cancel does nothing (just closes)
            }
        );
    }

    createDialog(title, contentHTML, ...buttons) {
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.background = 'var(--amiga-window-bg, #c0c0c0)';
        dialog.style.border = '4px solid';
        dialog.style.borderColor = 'var(--bevel-light, #ffffff) var(--bevel-dark, #808080) var(--bevel-dark, #808080) var(--bevel-light, #ffffff)';
        dialog.style.padding = '20px';
        dialog.style.width = '380px';
        dialog.style.maxWidth = '92%';
        dialog.style.boxShadow = '6px 6px 0 rgba(0,0,0,0.7)';
        dialog.style.zIndex = '10000';
        dialog.style.fontFamily = 'monospace';
        dialog.style.fontSize = '15px';
        dialog.style.color = 'var(--amiga-text, #000000)';

        dialog.innerHTML = `
            <div style="background: var(--amiga-title-active, #0000aa); color: var(--amiga-title-text, #ffffff); 
                        padding: 6px 10px; margin-bottom: 16px; text-align: center; font-weight: bold;">
                ${title}
            </div>
            <div style="margin-bottom: 24px; line-height: 1.5;">
                ${contentHTML}
            </div>
            <div style="text-align: center; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                ${buttons.map((btnText, i) => `
                    <button class="dialog-btn" data-choice="${btnText}" 
                            style="padding: 6px 22px; min-width: 80px; font-family: monospace;">
                        ${btnText}
                    </button>
                `).join('')}
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(0,0,0,0.4)';
        overlay.style.zIndex = '9999';

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        const close = () => {
            dialog.remove();
            overlay.remove();
        };

        dialog.querySelectorAll('.dialog-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const choice = btn.dataset.choice;
                if (dialog.onChoice) dialog.onChoice(choice);
                close();
            });
        });

        // Store callback
        dialog.onChoice = buttons.length > 1 ? arguments[3] : null;

        // Escape key support
        const esc = (e) => {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', esc);
            }
        };
        document.addEventListener('keydown', esc);
    }
}
