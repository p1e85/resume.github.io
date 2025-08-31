document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const createBtn = document.getElementById('createBtn');
    const modal = document.getElementById('dataModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const dataForm = document.getElementById('dataForm');
    const messageList = document.getElementById('messageList');

    // State
    let messages = JSON.parse(localStorage.getItem('retroDbMessages')) || [];

    // --- Functions ---

    /**
     * Renders the list of messages on the main page.
     */
    const renderMessages = () => {
        messageList.innerHTML = ''; // Clear the list first
        if (messages.length === 0) {
            messageList.innerHTML = '<p>// NO ENTRIES FOUND. CREATE ONE.</p>';
            return;
        }
        messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = 'message-item';
            messageEl.textContent = `> ${msg.fileName}.txt - [${msg.subject}]`;
            messageList.appendChild(messageEl);
        });
    };

    /**
     * Shows the modal pop-up.
     */
    const showModal = () => {
        modal.classList.remove('hidden');
    };

    /**
     * Hides the modal pop-up and resets the form.
     */
    const hideModal = () => {
        modal.classList.add('hidden');
        dataForm.reset();
    };

    /**
     * Creates a text file in memory and triggers a download.
     * @param {string} filename - The name of the file to be saved.
     * @param {string} text - The content of the file.
     */
    const downloadTxtFile = (filename, text) => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.style.display = 'none';
        a.href = url;
        a.download = `${filename}.txt`;
        
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
    
    /**
     * Handles the form submission.
     */
    const handleFormSubmit = (event) => {
        event.preventDefault();

        const fileName = document.getElementById('fileName').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!fileName || !subject || !message) {
            alert('ALL FIELDS ARE REQUIRED.');
            return;
        }

        // 1. Prepare file content
        const fileContent = `Subject: ${subject}\n\n---\n\n${message}`;
        
        // 2. Trigger the download
        downloadTxtFile(fileName, fileContent);
        
        // 3. Add to our local list and update storage
        const newMessage = { fileName, subject };
        messages.push(newMessage);
        localStorage.setItem('retroDbMessages', JSON.stringify(messages));
        
        // 4. Re-render the list and hide modal
        renderMessages();
        hideModal();
    };


    // --- Event Listeners ---
    createBtn.addEventListener('click', showModal);
    cancelBtn.addEventListener('click', hideModal);
    
    // Also hide modal if user clicks on the dark overlay
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });
    
    dataForm.addEventListener('submit', handleFormSubmit);

    // --- Initial Load ---
    renderMessages();
});
