/**
 * Daily Pulse - Core Logic
 * Project Structure: js/listapp.js
 */

const app = {
    // 1. STATE MANAGEMENT
    tasks: JSON.parse(localStorage.getItem('dailyTasks')) || [],
    theme: localStorage.getItem('userTheme') || 'theme-cyber',
    history: JSON.parse(localStorage.getItem('taskHistory')) || [],

    // 2. TEMPLATE DATA
    templateData: {
        morning: [
            { id: 101, icon: '☀️', name: 'Drink Water', time: '07:00', completed: false, notified: false },
            { id: 102, icon: '🧘', name: 'Morning Meditate', time: '07:30', completed: false, notified: false },
            { id: 103, icon: '🍳', name: 'Healthy Breakfast', time: '08:00', completed: false, notified: false }
        ],
        work: [
            { id: 201, icon: '📧', name: 'Check Emails', time: '09:00', completed: false, notified: false },
            { id: 202, icon: '📝', name: 'Daily Planning', time: '09:15', completed: false, notified: false }
        ],
        health: [
            { id: 301, icon: '🚶', name: '10k Steps Walk', time: '18:00', completed: false, notified: false },
            { id: 302, icon: '💊', name: 'Vitamins', time: '20:00', completed: false, notified: false }
        ]
    },

    // 3. INITIALIZATION
    init() {
        // Set Theme
        document.body.className = this.theme;
        document.getElementById('theme-selector').value = this.theme;

        // Hide Overlay & Show App
        document.getElementById('auth-overlay').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');

        // Initial Logic Checks
        this.checkMidnightReset();
        this.requestNotificationPermission();
        this.render();

        // Real-time Check (Every 30 seconds)
        setInterval(() => {
            this.checkOverdueNotifications();
            this.render();
        }, 30000);
    },

    // 4. THEME LOGIC
    changeTheme(newTheme) {
        this.theme = newTheme;
        document.body.className = newTheme;
        localStorage.setItem('userTheme', newTheme);
    },

    // 5. TASK LOGIC (CRUD)
    addCustomTask() {
        const nameInput = document.getElementById('task-name');
        const timeInput = document.getElementById('task-time');
        const emojiInput = document.getElementById('task-emoji');

        if (!nameInput.value || !timeInput.value) {
            alert("Please provide at least a name and a time.");
            return;
        }

        const newTask = {
            id: Date.now(),
            name: nameInput.value,
            time: timeInput.value,
            icon: emojiInput.value || '📍',
            completed: false,
            notified: false
        };

        this.tasks.push(newTask);
        this.save();
        this.toggleModal('custom-modal', false);

        // Reset Inputs
        nameInput.value = '';
        timeInput.value = '';
        emojiInput.value = '';
    },

    applyTemplate(key) {
        const newTasks = this.templateData[key].map(t => ({
            ...t, 
            id: Date.now() + Math.random(),
            notified: false 
        }));
        this.tasks = [...this.tasks, ...newTasks];
        this.save();
        this.toggleModal('template-modal', false);
    },

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
    },

    toggleTask(id) {
        this.tasks = this.tasks.map(t => {
            if (t.id === id) return { ...t, completed: !t.completed };
            return t;
        });
        this.save();
    },

    // 6. STORAGE & RENDERING
    save() {
        localStorage.setItem('dailyTasks', JSON.stringify(this.tasks));
        this.render();
    },

    render() {
        const list = document.getElementById('task-list');
        const scoreEl = document.getElementById('score');
        
        // Calculate Score
        const completedCount = this.tasks.filter(t => t.completed).length;
        const totalCount = this.tasks.length;
        const score = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
        scoreEl.innerText = `Daily Score: ${score}%`;

        // Generate HTML
        list.innerHTML = this.tasks.map(t => {
            const isOverdue = this.isTimePast(t.time) && !t.completed;
            return `
                <li class="task-card ${t.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                    <button class="delete-btn" onclick="app.deleteTask(${t.id})">✕</button>
                    <span class="task-emoji">${t.icon}</span>
                    <div class="task-info">
                        <h3>${t.name}</h3>
                        <p>${t.time} ${isOverdue ? '<span style="color:var(--danger); font-weight:bold;"> - Overdue!</span>' : ''}</p>
                    </div>
                    <div class="check-container" onclick="app.toggleTask(${t.id})">
                        <div class="custom-checkbox"></div>
                    </div>
                </li>
            `;
        }).join('');
    },

    // 7. TIME & NOTIFICATION LOGIC
    isTimePast(targetTime) {
        const now = new Date();
        const [hours, minutes] = targetTime.split(':');
        const target = new Date();
        target.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return now > target;
    },

    requestNotificationPermission() {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    },

    checkOverdueNotifications() {
        this.tasks.forEach(t => {
            if (!t.completed && !t.notified && this.isTimePast(t.time)) {
                this.sendNotification(t);
                t.notified = true; // Prevents spamming notifications
                this.save();
            }
        });
    },

    sendNotification(task) {
        if (Notification.permission === "granted") {
            new Notification(`Daily Pulse: ${task.name}`, {
                body: `It's time for your task! (${task.time})`,
                icon: 'https://cdn-icons-png.flaticon.com/512/3176/3176395.png'
            });
        }
    },

    // 8. DATA TRACKING & RESET
    checkMidnightReset() {
        const lastReset = localStorage.getItem('lastResetDate');
        const today = new Date().toLocaleDateString();

        if (lastReset && lastReset !== today) {
            // Archive Yesterday's Stats
            const completed = this.tasks.filter(t => t.completed).length;
            const total = this.tasks.length;
            this.history.push({
                date: lastReset,
                score: total === 0 ? 0 : Math.round((completed / total) * 100)
            });
            localStorage.setItem('taskHistory', JSON.stringify(this.history));

            // Reset Tasks for the new day
            this.tasks = this.tasks.map(t => ({ ...t, completed: false, notified: false }));
            this.save();
        }
        localStorage.setItem('lastResetDate', today);
    },

    // 9. UI HELPERS
    toggleModal(id, show) {
        const modal = document.getElementById(id);
        if (show) modal.classList.remove('hidden');
        else modal.classList.add('hidden');
    }
};

// Initial Start Script is managed by the HTML button "Enter as Guest"
