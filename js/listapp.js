import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAWmA5H8V9VVIBNFmZFaX8dn4OMe8QujDg",
    authDomain: "daily-pulse-99c89.firebaseapp.com",
    projectId: "daily-pulse-99c89",
    storageBucket: "daily-pulse-99c89.firebasestorage.app",
    messagingSenderId: "873686291276",
    appId: "1:873686291276:web:b3ffe590158bc86dd635e9",
    measurementId: "G-3FXFJ3DW5J"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const userId = "patrick_user_1"; // Sync ID for Phone & Watch

const app = {
    tasks: [],
    theme: localStorage.getItem('userTheme') || 'theme-cyber',

    init() {
        document.body.className = this.theme;
        document.getElementById('theme-selector').value = this.theme;
        document.getElementById('auth-overlay').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');

        this.updateDynamicCalendar();
        this.listenToCloud(); // The "Secret Sauce" for Watch Sync
        
        setInterval(() => this.render(), 30000);
    },

    listenToCloud() {
        onSnapshot(doc(db, "users", userId), (docSnap) => {
            if (docSnap.exists()) {
                this.tasks = docSnap.data().tasks || [];
                this.render();
            }
        });
    },

    async save() {
        await setDoc(doc(db, "users", userId), { tasks: this.tasks });
    },

    updateDynamicCalendar() {
        const now = new Date();
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        document.getElementById('cal-month').innerText = months[now.getMonth()];
        document.getElementById('cal-date').innerText = now.getDate();
    },

    render() {
        const list = document.getElementById('task-list');
        const scoreEl = document.getElementById('score');
        const done = this.tasks.filter(t => t.completed).length;
        const score = this.tasks.length === 0 ? 0 : Math.round((done / this.tasks.length) * 100);
        scoreEl.innerText = `Score: ${score}%`;

        list.innerHTML = this.tasks.map(t => {
            const isOverdue = this.checkPast(t.time) && !t.completed;
            return `
                <li class="task-card ${t.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                    <div class="check-container" onclick="window.app.toggleTask(${t.id})">
                        <div class="custom-checkbox"></div>
                    </div>
                    <span class="task-emoji">${t.icon || '📍'}</span>
                    <div class="task-info">
                        <h3>${t.name}</h3>
                        <p>${t.time}</p>
                    </div>
                    <button class="delete-btn" onclick="window.app.deleteTask(${t.id})">✕</button>
                </li>
            `;
        }).join('');
    },

    checkPast(time) {
        const [h, m] = time.split(':');
        const target = new Date();
        target.setHours(h, m, 0, 0);
        return new Date() > target;
    },

    toggleTask(id) {
        this.tasks = this.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        this.save();
    },

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
    },

    addCustomTask() {
        const name = document.getElementById('task-name').value;
        const time = document.getElementById('task-time').value;
        const emoji = document.getElementById('task-emoji').value;
        if (!name || !time) return alert("Fill Name/Time");
        this.tasks.push({ id: Date.now(), name, time, icon: emoji, completed: false });
        this.save();
        this.toggleModal('custom-modal', false);
    },

    changeTheme(t) {
        this.theme = t;
        document.body.className = t;
        localStorage.setItem('userTheme', t);
    },

    toggleModal(id, show) { document.getElementById(id).classList.toggle('hidden', !show); },
    
    applyTemplate(k) {
        const tps = {
            morning: [{name:'Water', time:'07:00', icon:'💧'}, {name:'Meditate', time:'07:30', icon:'🧘'}],
            work: [{name:'Email', time:'09:00', icon:'📧'}, {name:'Planning', time:'09:15', icon:'📝'}],
            health: [{name:'Vitamins', time:'08:00', icon:'💊'}, {name:'Walk', time:'18:00', icon:'🚶'}]
        };
        this.tasks = [...this.tasks, ...tps[k].map(t => ({...t, id: Date.now()+Math.random(), completed: false}))];
        this.save();
        this.toggleModal('template-modal', false);
    }
};

window.app = app; // Expose to HTML
app.init();
