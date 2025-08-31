document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const createBtn = document.getElementById('createBtn');
    const modal = document.getElementById('dataModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const dataForm = document.getElementById('dataForm');
    const messageList = document.getElementById('messageList');
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveBtn');

    // NEW: Action Buttons
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // State
    let messages = JSON.parse(localStorage.getItem('retroDbMessages')) || [];
    let editIndex = null; // To track if we are in "edit mode"

    // --- Functions ---

    /**
     * Update the enabled/disabled state of action buttons based on selections.
     */
    const updateActionButtons = () => {
        const selectedCount = messageList.querySelectorAll('input[type="checkbox"]:checked').length;
        
        editBtn.disabled = selectedCount !== 1;
        deleteBtn.disabled = selectedCount === 0;
        clearAllBtn.disabled = messages.length === 0;
    };

    /**
     * Renders the list of messages on the main page.
     */
    const renderMessages = () => {
        messageList.innerHTML = ''; // Clear the list first
        if (messages.length === 0) {
            messageList.innerHTML = '<p>// NO ENTRIES FOUND. CREATE ONE.</p>';
        } else {
            messages.forEach((msg, index) => {
                const messageEl = document.createElement('div');
                messageEl.className = 'message-item';
                // Use a data attribute to store the index
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
    
    /**
     * Shows the modal pop-up, configuring it for "Create" or "Edit" mode.
     */
    const showModal = (isEditMode = false, data = {}) => {
        if (isEditMode) {
            modalTitle.textContent = "EDIT DATA ENTRY";
            saveBtn.textContent = "> SAVE CHANGES";
            document.getElementById('fileName').value = data.fileName;
            document.getElementById('subject').value = data.subject;
            document.getElementById('message').value = data.message;
        } else {
            modalTitle.textContent = "NEW DATA ENTRY";
            saveBtn.textContent = "> SAVE & DOWNLOAD";
        }
        modal.classList.remove('hidden');
    };

    /**
     * Hides the modal pop-up and resets the form and edit state.
     */
    const hideModal = () => {
        modal.classList.add('hidden');
        dataForm.reset();
        editIndex = null; // Always exit edit mode when closing modal
    };
    
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
        
        const fileContent = `Subject: ${subject}\n\n---\n\n${message}`;
        const newMessageData = { fileName, subject, message };

        if (editIndex !== null) {
            // Edit mode
            messages[editIndex] = newMessageData;
        } else {
            // Create mode
            messages.push(newMessageData);
            downloadTxtFile(fileName, fileContent); // Only download for new entries
        }

        localStorage.setItem('retroDbMessages', JSON.stringify(messages));
        renderMessages();
        hideModal();
    };

    // --- NEW: Event Handlers for Actions ---

    const handleEdit = () => {
        const checkedBox = messageList.querySelector('input[type="checkbox"]:checked');
        if (!checkedBox) return;

        // Get index from the parent message-item's data-index attribute
        const itemDiv = checkedBox.closest('.message-item');
        editIndex = parseInt(itemDiv.dataset.index, 10);
        
        const messageToEdit = messages[editIndex];
        showModal(true, messageToEdit);
    };

    const handleDelete = () => {
        const checkedBoxes = messageList.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length === 0) return;
        
        if (!confirm(`Are you sure you want to delete ${checkedBoxes.length} item(s)?`)) {
            return;
        }

        // Get all indexes to delete
        const indexesToDelete = Array.from(checkedBoxes).map(box => {
            return parseInt(box.closest('.message-item').dataset.index, 10);
        });

        // Filter out the messages to be deleted
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
    createBtn.addEventListener('click', () => showModal());
    cancelBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) hideModal();
    });
    dataForm.addEventListener('submit', handleFormSubmit);

    // NEW: Action button listeners
    editBtn.addEventListener('click', handleEdit);
    deleteBtn.addEventListener('click', handleDelete);
    clearAllBtn.addEventListener('click', handleClearAll);

    // Use event delegation for checkboxes to improve performance
    messageList.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            updateActionButtons();
        }
    });

    // --- Initial Load ---
    renderMessages();
});
