document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const createBtn = document.getElementById('createBtn');
    const modal = document.getElementById('dataModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const dataForm = document.getElementById('dataForm');
    const messageList = document.getElementById('messageList');
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveBtn');

    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    
    // NEW: Theme Toggle Elements
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const body = document.body;
    const themeKey = 'retro-db-theme';

    // State
    let messages = JSON.parse(localStorage.getItem('retroDbMessages')) || [];
    let editIndex = null;

    // --- Functions ---
    
    // NEW: Theme Functions
    const applyTheme = (theme) => {
        if (theme === 'amber') {
            body.classList.add('theme-amber');
        } else {
            body.classList.remove('theme-amber');
        }
    };

    const toggleTheme = () => {
        const currentTheme = body.classList.contains('theme-amber') ? 'default' : 'amber';
        localStorage.setItem(themeKey, currentTheme);
        applyTheme(currentTheme);
    };
    // End of NEW Theme Functions

    const updateActionButtons = () => {
        const selectedCount = messageList.querySelectorAll('input[type="checkbox"]:checked').length;
        
        editBtn.disabled = selectedCount !== 1;
        deleteBtn.disabled = selectedCount === 0;
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

    const hideModal = () => {
        modal.classList.add('hidden');
        dataForm.reset();
        editIndex = null;
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
            messages[editIndex] = newMessageData;
        } else {
            messages.push(newMessageData);
            downloadTxtFile(fileName, fileContent);
        }

        localStorage.setItem('retroDbMessages', JSON.stringify(messages));
        renderMessages();
        hideModal();
    };

    const handleEdit = () => {
        const checkedBox = messageList.querySelector('input[type="checkbox"]:checked');
        if (!checkedBox) return;

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
    createBtn.addEventListener('click', () => showModal());
    cancelBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) hideModal();
    });
    dataForm.addEventListener('submit', handleFormSubmit);

    editBtn.addEventListener('click', handleEdit);
    deleteBtn.addEventListener('click', handleDelete);
    clearAllBtn.addEventListener('click', handleClearAll);

    messageList.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            updateActionButtons();
        }
    });
    
    // NEW: Theme toggle listener
    themeToggleBtn.addEventListener('click', toggleTheme);

    // --- Initial Load ---
    const savedTheme = localStorage.getItem(themeKey) || 'default';
    applyTheme(savedTheme);
    renderMessages();
});

