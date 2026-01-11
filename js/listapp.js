const app = {
    isGuest: false,
    tasks: [],

    init() {
        this.checkMidnightReset();
        this.render();
    },

    // 1. Midnight Reset Logic
    checkMidnightReset() {
        const lastReset = localStorage.getItem('lastResetDate');
        const today = new Date().toLocaleDateString();

        if (lastReset !== today) {
            this.archiveDailyData(); // Save stats before clearing
            this.resetTasks();       // Uncheck everything
            localStorage.setItem('lastResetDate', today);
        }
    },

    // 2. Data Tracking (Archive)
    archiveDailyData() {
        const completed = this.tasks.filter(t => t.completed).length;
        const total = this.tasks.length;
        
        const dayStats = {
            date: localStorage.getItem('lastResetDate'),
            completed: completed,
            total: total,
            missed: total - completed
        };

        // Save to History (Local or Firebase)
        let history = JSON.parse(localStorage.getItem('history') || '[]');
        history.push(dayStats);
        localStorage.setItem('history', JSON.stringify(history));
    },

    resetTasks() {
        this.tasks.forEach(task => task.completed = false);
        this.saveData();
    },

    // 3. Storage Manager
    enableGuestMode() {
        this.isGuest = true;
        document.getElementById('auth-overlay').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        this.loadLocalData();
    },

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        task.completed = !task.completed;
        this.render();
        this.saveData();
    }
};

// Start logic
app.init();
