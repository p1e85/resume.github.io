// js/classes/DialogManager.js
// Handles Amiga-style requester dialogs

export class DialogManager {
    showAboutDialog() {
        const dialogHTML = `
            <div id="about-dialog" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                        background: var(--amiga-window-bg, #c0c0c0); 
                        border: 4px solid; 
                        border-color: var(--bevel-light, #ffffff) var(--bevel-dark, #808080) var(--bevel-dark, #808080) var(--bevel-light, #ffffff);
                        padding: 20px; width: 420px; max-width: 90%; font-family: monospace; 
                        box-shadow: 6px 6px 0 #00000080; z-index: 10000; color: var(--amiga-text, #000000);">
                
                <div style="background: var(--amiga-title-active, #0000aa); color: var(--amiga-title-text, #ffffff); 
                            padding: 6px; text-align: center; margin-bottom: 16px; font-weight: bold;">
                    About Amiga Pad
                </div>
                
                <div style="line-height: 1.5;">
                    <p><strong>Amiga Pad</strong> — Version 0.2</p>
                    <p>A multi-tab notepad with authentic Amiga Workbench 1.3 styling.</p>
                    <p>Features classic Notepad functions + tabs, sessions, and retro vibes.</p>
                    <p style="margin-top: 12px;">Coded with Grok by xAI</p>
                </div>
                
                <div style="text-align: center; margin-top: 24px;">
                    <button id="about-ok-btn" 
                            style="padding: 6px 20px; background: var(--amiga-button, #c0c0c0); 
                                   border: 2px solid; border-color: var(--bevel-light) var(--bevel-dark) var(--bevel-dark) var(--bevel-light); 
                                   cursor: pointer; font-family: monospace;">
                        OK
                    </button>
                </div>
            </div>
            
            <!-- Backdrop -->
            <div id="about-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999;"></div>
        `;

        const container = document.createElement('div');
        container.innerHTML = dialogHTML;
        document.body.appendChild(container);

        // Close handlers
        const closeDialog = () => container.remove();

        document.getElementById('about-ok-btn').addEventListener('click', closeDialog);
        document.getElementById('about-overlay').addEventListener('click', closeDialog);

        // Allow Escape key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeDialog();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
}
