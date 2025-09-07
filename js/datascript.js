document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const createBtn = document.getElementById('createBtn');
    const dataModal = document.getElementById('dataModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const dataForm = document.getElementById('dataForm');
    const messageList = document.getElementById('messageList');
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveBtn');

    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const downloadBtn = document.getElementById('downloadBtn'); 
    
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const body = document.body;
    const themeKey = 'retro-db-theme';

    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const closeInfoBtn = document.getElementById('closeInfoBtn');

    // --- State ---
    let messages = JSON.parse(localStorage.getItem('retroDbMessages')) || [];
    let editIndex = null;
    const themes = ['default', 'amber', 'vaporwave', 'monochrome'];

    // --- Functions ---
    
    // Theme Functions
    const applyTheme = (themeName) => {
        body.classList.remove('theme-amber', 'theme-vaporwave', 'theme-monochrome');
        
        if (themeName !== 'default') {
            body.classList.add(`theme-${themeName}`);
        }
    };

    const toggleTheme = () => {
        const currentTheme = localStorage.getItem(themeKey) || 'default';
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        localStorage.setItem(themeKey, nextTheme);
        applyTheme(nextTheme);
    };

    // Action Button and List Rendering Functions
    const updateActionButtons = () => {
        const selectedCount = messageList.querySelectorAll('input[type="checkbox"]:checked').length;
        
        editBtn.disabled = selectedCount !== 1;
        deleteBtn.disabled = selectedCount === 0;
        downloadBtn.disabled = selectedCount === 0; 
        clearAllBtn.disabled = messages.length === 0;
    };

    const renderMessages = () => {
        messageList.innerHTML = ''; 
        if (messages.length === 0) {
            messageList.innerHTML = '<p>// NO ENTRIES FOUND. CREATE ONE.</p>';
        } else {
            messages.forEach((msg, index) => {
                const messageEl = document.createElement('div');
                messageEl.className = 'message-item';
                messageEl.dataset.index = index; 

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `item-${index}`;
                
                const label = document.createElement('label');
                label.htmlFor = `item-${index}`;
                label.textContent = `> ${msg.fileName}.txt - [${msg.subject}]`;
                
                messageEl.appendChild(checkbox);
                messageEl.appendChild(label);
                messageList.appendChild(messageEl);
            });
        }
        updateActionButtons();
    };
    
    // Data Modal Functions
    const showDataModal = (isEditMode = false, data = {}) => {
        if (isEditMode) {
            modalTitle.textContent = "EDIT DATA ENTRY";
            saveBtn.textContent = "> SAVE CHANGES";
            document.getElementById('fileName').value = data.fileName;
            document.getElementById('subject').value = data.subject;
            document.getElementById('message').value = data.message;
        } else {
            modalTitle.textContent = "NEW DATA ENTRY";
            saveBtn.textContent = "> SAVE ENTRY";
        }
        dataModal.classList.remove('hidden');
    };

    const hideDataModal = () => {
        dataModal.classList.add('hidden');
        dataForm.reset();
        editIndex = null;
    };
    
    // Info Modal Functions
    const showInfoModal = () => {
        infoModal.classList.remove('hidden');
    };

    const hideInfoModal = () => {
        infoModal.classList.add('hidden');
    };

    // Utility and Handler Functions
    const downloadTxtFile = (filename, text) => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.txt`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
    
    const handleFormSubmit = (event) => {
        event.preventDefault();

        const fileName = document.getElementById('fileName').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!fileName || !subject || !message) {
            alert('ALL FIELDS ARE REQUIRED.');
            return;
        }
        
        const newMessageData = { fileName, subject, message };

        if (editIndex !== null) {
            messages[editIndex] = newMessageData;
        } else {
            messages.push(newMessageData);
        }

        localStorage.setItem('retroDbMessages', JSON.stringify(messages));
        renderMessages();
        hideDataModal();
    };

    const handleEdit = () => {
        const checkedBox = messageList.querySelector('input[type="checkbox"]:checked');
        if (!checkedBox) return;

        const itemDiv = checkedBox.closest('.message-item');
        editIndex = parseInt(itemDiv.dataset.index, 10);
        
        const messageToEdit = messages[editIndex];
        showDataModal(true, messageToEdit);
    };

    // UPDATED: handleDownload function with new logic
    const handleDownload = () => {
        const checkedBoxes = messageList.querySelectorAll('input[type="checkbox"]:checked');
        const selectedCount = checkedBoxes.length;

        if (selectedCount === 0) {
            return; // Should not happen since button is disabled, but good practice
        }

        if (selectedCount === 1) {
            // If only one is selected, download it as a single file (original behavior)
            const box = checkedBoxes[0];
            const itemDiv = box.closest('.message-item');
            const index = parseInt(itemDiv.dataset.index, 10);
            const messageData = messages[index];
            
            const fileContent = `Subject: ${messageData.subject}\n\n---\n\n${messageData.message}`;
            downloadTxtFile(messageData.fileName, fileContent);

        } else {
            // If multiple are selected, compile them into one file
            let combinedContent = `// RETRO-DB BATCH EXPORT\n// EXPORTED ON: ${new Date().toLocaleString()}\n\n`;

            checkedBoxes.forEach(box => {
                const itemDiv = box.closest('.message-item');
                const index = parseInt(itemDiv.dataset.index, 10);
                const messageData = messages[index];

                combinedContent += `========================================\n`;
                combinedContent += `FILENAME: ${messageData.fileName}.txt\n`;
                combinedContent += `SUBJECT:  ${messageData.subject}\n`;
                combinedContent += `----------------------------------------\n\n`;
                combinedContent += `${messageData.message}\n\n`;
            });

            // Create a generic, timestamped filename for the batch export
            const today = new Date();
            const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const filename = `retro-db-export-${dateString}`;
            
            downloadTxtFile(filename, combinedContent);
        }
    };

    const handleDelete = () => {
        const checkedBoxes = messageList.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length === 0) return;
        
        if (!confirm(`Are you sure you want to delete ${checkedBoxes.length} item(s)?`)) {
            return;
        }

        const indexesToDelete = Array.from(checkedBoxes).map(box => {
            return parseInt(box.closest('.message-item').dataset.index, 10);
        });

        messages = messages.filter((_, index) => !indexesToDelete.includes(index));

        localStorage.setItem('retroDbMessages', JSON.stringify(messages));
        renderMessages();
    };
    
    const handleClearAll = () => {
        if (!confirm("Are you sure you want to delete ALL entries? This cannot be undone.")) {
            return;
        }
        messages = [];
        localStorage.setItem('retroDbMessages', JSON.stringify(messages));
        renderMessages();
    };

    // --- Event Listeners ---
    createBtn.addEventListener('click', () => showDataModal());
    cancelBtn.addEventListener('click', hideDataModal);
    dataModal.addEventListener('click', (event) => {
        if (event.target === dataModal) hideDataModal();
    });
    dataForm.addEventListener('submit', handleFormSubmit);

    editBtn.addEventListener('click', handleEdit);
    deleteBtn.addEventListener('click', handleDelete);
    clearAllBtn.addEventListener('click', handleClearAll);
    downloadBtn.addEventListener('click', handleDownload); 

    messageList.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            updateActionButtons();
        }
    });
    
    themeToggleBtn.addEventListener('click', toggleTheme);

    infoBtn.addEventListener('click', showInfoModal);
    closeInfoBtn.addEventListener('click', hideInfoModal);
    infoModal.addEventListener('click', (event) => {
        if (event.target === infoModal) {
            hideInfoModal();
        }
    });


    // --- Initial Load ---
    const savedTheme = localStorage.getItem(themeKey) || 'default';
    applyTheme(savedTheme);
    renderMessages();
});
