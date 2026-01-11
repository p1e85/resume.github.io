const app = {
    tasks: JSON.parse(localStorage.getItem('dailyTasks')) || [],
    theme: localStorage.getItem('userTheme') || 'theme-cyber',

    init() {
        document.body.className = this.theme;
        document.getElementById('theme-selector').value = this.theme;
        document.getElementById('auth-overlay').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');

        this.checkMidnightReset();
        this.render();
        setInterval(() => this.render(), 30000); // Pulse check
    },

    changeTheme(newTheme) {
        this.theme = newTheme;
        document.body.className = newTheme;
        localStorage.setItem('userTheme', newTheme);
    },

    // --- TASK ACTIONS ---
    addCustomTask() {
        const name = document.getElementById('task-name').value;
        const time = document.getElementById('task-time').value;
        const emoji = document.getElementById('task-emoji').value || '📍';

        if (!name || !time) return alert("Please fill in Name and Time");

        this.tasks.push({ id: Date.now(), name, time, icon: emoji, completed: false });
        this.save();
        this.toggleModal('custom-modal', false);
        document.getElementById('task-name').value = '';
    },

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
    },

    toggleTask(id) {
        this.tasks = this.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        this.save();
    },

    save() {
        localStorage.setItem('dailyTasks', JSON.stringify(this.tasks));
        this.render();
    },

    // --- RENDER (MODERN VERTICAL LAYOUT) ---
    render() {
        const list = document.getElementById('task-list');
        const scoreEl = document.getElementById('score');
        
        const completed = this.tasks.filter(t => t.completed).length;
        const score = this.tasks.length === 0 ? 0 : Math.round((completed / this.tasks.length) * 100);
        scoreEl.innerText = `Score: ${score}%`;

        list.innerHTML = this.tasks.map(t => {
            const isOverdue = this.isPast(t.time) && !t.completed;
            return `
                <li class="task-card ${t.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                    <div class="check-container" onclick="app.toggleTask(${t.id})">
                        <div class="custom-checkbox"></div>
                    </div>
                    <span class="task-emoji">${t.icon}</span>
                    <div class="task-info">
                        <h3>${t.name}</h3>
                        <p>${t.time} ${isOverdue ? '<b style="color:var(--danger)">!</b>' : ''}</p>
                    </div>
                    <button class="delete-btn" onclick="app.deleteTask(${t.id})">✕</button>
                </li>
            `;
        }).join('');
    },

    isPast(targetTime) {
        const [h, m] = targetTime.split(':');
        const target = new Date();
        target.setHours(h, m, 0, 0);
        return new Date() > target;
    },

    checkMidnightReset() {
        const last = localStorage.getItem('lastResetDate');
        const today = new Date().toLocaleDateString();
        if (last && last !== today) {
            this.tasks = this.tasks.map(t => ({ ...t, completed: false }));
            this.save();
        }
        localStorage.setItem('lastResetDate', today);
    },

    toggleModal(id, show) {
        document.getElementById(id).classList.toggle('hidden', !show);
    },

    applyTemplate(key) {
        const templates = {
            morning: [{icon:'☀️', name:'Water', time:'07:00'}, {icon:'🧘', name:'Meditate', time:'07:30'}],
            work: [{icon:'📧', name:'Emails', time:'09:00'}, {icon:'📝', name:'Planning', time:'09:30'}],
            health: [{icon:'🍎', name:'Vitamins', time:'08:00'}, {icon:'🚶', name:'Walk', time:'18:00'}]
        };
        const newTasks = templates[key].map(t => ({ ...t, id: Date.now() + Math.random(), completed: false }));
        this.tasks = [...this.tasks, ...newTasks];
        this.save();
        this.toggleModal('template-modal', false);
    }
};
