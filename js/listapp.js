const app = {
    tasks: JSON.parse(localStorage.getItem('myTasks')) || [],
    
    templateData: {
        morning: [
            { id: 1, icon: '☀️', text: 'Drink 16oz Water', time: '07:00', completed: false },
            { id: 2, icon: '🧘', text: 'Meditate 10min', time: '08:00', completed: false }
        ],
        work: [
            { id: 3, icon: '📧', text: 'Clear Inbox', time: '09:00', completed: false },
            { id: 4, icon: '📝', text: 'Top 3 Daily Tasks', time: '10:00', completed: false }
        ],
        health: [
            { id: 5, icon: '🚶', text: '10k Steps', time: '18:00', completed: false },
            { id: 6, icon: '💊', text: 'Take Vitamins', time: '21:00', completed: false }
        ]
    },

    init() {
        // Hide auth for now as requested
        document.getElementById('auth-overlay').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');

        this.checkMidnightReset();
        this.render();

        // Check for "Overdue" status every 30 seconds
        setInterval(() => {
            console.log("Checking for overdue tasks...");
            this.render(); 
        }, 30000);
    },

    // --- LOGIC: OVERDUE CHECK ---
    isOverdue(taskTime, isCompleted) {
        if (isCompleted) return false;

        const now = new Date();
        const [hours, minutes] = taskTime.split(':');
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        return now > scheduledTime;
    },

    // --- LOGIC: MIDNIGHT RESET ---
    checkMidnightReset() {
        const lastReset = localStorage.getItem('lastResetDate');
        const today = new Date().toLocaleDateString();

        if (lastReset && lastReset !== today) {
            this.archiveDailyData(lastReset);
            this.tasks = this.tasks.map(t => ({ ...t, completed: false }));
            this.saveAndRender();
        }
        localStorage.setItem('lastResetDate', today);
    },

    archiveDailyData(date) {
        const completed = this.tasks.filter(t => t.completed).length;
        const total = this.tasks.length;
        const history = JSON.parse(localStorage.getItem('history') || '[]');
        history.push({ date, completed, total, score: Math.round((completed/total)*100) || 0 });
        localStorage.setItem('history', JSON.stringify(history));
    },

    // --- UI ACTIONS ---
    addTemplate(key) {
        const newTasks = this.templateData[key].map(t => ({...t, id: Date.now() + Math.random()}));
        this.tasks = [...this.tasks, ...newTasks];
        this.saveAndRender();
        this.closeTemplates();
    },

    toggleTask(id) {
        this.tasks = this.tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
        this.saveAndRender();
    },

    saveAndRender() {
        localStorage.setItem('myTasks', JSON.stringify(this.tasks));
        this.render();
    },

    render() {
        const listContainer = document.getElementById('task-list');
        const completedCount = this.tasks.filter(t => t.completed).length;
        
        // Update Stats at top
        if(document.getElementById('score')) {
            const percent = Math.round((completedCount / this.tasks.length) * 100) || 0;
            document.getElementById('score').innerText = `Daily Score: ${percent}%`;
        }

        listContainer.innerHTML = this.tasks.map(t => {
            const overdueClass = this.isOverdue(t.time, t.completed) ? 'overdue' : '';
            return `
                <li class="task-card ${t.completed ? 'completed' : ''} ${overdueClass}">
                    <span class="task-emoji">${t.icon}</span>
                    <div class="task-info">
                        <h3>${t.text}</h3>
                        <p>Time: ${t.time} ${overdueClass ? '<strong style="color:red;">(Overdue!)</strong>' : ''}</p>
                    </div>
                    <div class="check-container" onclick="app.toggleTask(${t.id})">
                        <div class="custom-checkbox"></div>
                    </div>
                </li>
            `;
        }).join('');
    },

    openTemplates() { document.getElementById('template-modal').classList.remove('hidden'); },
    closeTemplates() { document.getElementById('template-modal').classList.add('hidden'); }
};

app.init();
