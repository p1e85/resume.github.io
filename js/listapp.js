/**
 * Daily Pulse - Core Logic v1.4
 * P1 Creations LLC - Patrick DeQuattro
 * Features: Cloud Sync, Haptics, Daily Reset, & History Tracking
 */

// 1. Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWmA5H8V9VVIBNFmZFaX8dn4OMe8QujDg",
    authDomain: "daily-pulse-99c89.firebaseapp.com",
    projectId: "daily-pulse-99c89",
    storageBucket: "daily-pulse-99c89.firebasestorage.app",
    messagingSenderId: "873686291276",
    appId: "1:873686291276:web:b3ffe590158bc86dd635e9",
    measurementId: "G-3FXFJ3DW5J"
};

// 3. Initialize Firebase Services
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const app = {
    tasks: [],
    history: [], // Stores the last 7 days of scores
    currentUser: null,
    isSignUpMode: false,
    theme: localStorage.getItem('userTheme') || 'theme-cyber',

    init() {
        document.body.className = this.theme;
        this.updateDynamicCalendar();
        this.updateDynamicTitle();

        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = user;
                document.getElementById('auth-overlay').classList.add('hidden');
                document.getElementById('main-app').classList.remove('hidden');
                this.listenToCloud(); 
            } else {
                this.currentUser = null;
                document.getElementById('auth-overlay').classList.remove('hidden');
                document.getElementById('main-app').classList.add('hidden');
            }
        });

        setInterval(() => this.render(), 30000);
    },

    // --- HAPTIC ENGINE ---
    haptic(type = 'light') {
        if (!navigator.vibrate) return;
        if (type === 'light') navigator.vibrate(10);
        else if (type === 'success') navigator.vibrate([20, 30, 20]);
        else if (type === 'warning') navigator.vibrate(50);
    },

    // --- AUTH ENGINE ---
    toggleAuthMode() {
        this.isSignUpMode = !this.isSignUpMode;
        document.getElementById('auth-title').innerText = this.isSignUpMode ? "Create Account" : "Sign In";
        document.getElementById('auth-main-btn').innerText = this.isSignUpMode ? "Register" : "Sign In";
        document.getElementById('auth-toggle-link').innerText = this.isSignUpMode ? "Sign In" : "Create Account";
        document.getElementById('toggle-msg').innerText = this.isSignUpMode ? "Already have an account?" : "New here?";
        this.haptic('light');
    },

    async handleAuth() {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        if (!email || !pass) return alert("Please fill in all fields.");

        try {
            if (this.isSignUpMode) {
                await createUserWithEmailAndPassword(auth, email, pass);
            } else {
                await signInWithEmailAndPassword(auth, email, pass);
            }
            this.haptic('success');
        } catch (err) { alert(err.message); }
    },

    async logout() {
        this.haptic('warning');
        await signOut(auth);
        location.reload(); 
    },

    // --- CLOUD SYNC & NEW DAY LOGIC ---
    listenToCloud() {
        if (!this.currentUser) return;
        
        onSnapshot(doc(db, "users", this.currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                this.tasks = data.tasks || [];
                this.history = data.history || [];

                const lastCheckDate = data.lastCheckDate; 
                const todayDate = new Date().toDateString();

                if (lastCheckDate && lastCheckDate !== todayDate) {
                    // It's a New Day! Bank yesterday's score before resetting.
                    const done = this.tasks.filter(t => t.completed).length;
                    const lastScore = this.tasks.length === 0 ? 0 : Math.round((done / this.tasks.length) * 100);
                    
                    const historyEntry = { date: lastCheckDate, score: lastScore };
                    const updatedHistory = [historyEntry, ...this.history].slice(0, 7);

                    this.tasks = this.tasks.map(t => ({ ...t, completed: false }));
                    this.save(updatedHistory); 
                }
            } else {
                // First time user setup
                this.tasks = [{ id: 1, name: 'Welcome to Daily Pulse!', time: '08:00', icon: '👋', completed: false }];
                this.save([]); 
            }
            this.render();
        });
    },

    async save(updatedHistory = null) {
        if (!this.currentUser) return;
        
        const dataToSave = {
            email: this.currentUser.email,
            tasks: this.tasks,
            lastSync: new Date(),
            lastCheckDate: new Date().toDateString()
        };

        if (updatedHistory) dataToSave.history = updatedHistory;

        await setDoc(doc(db, "users", this.currentUser.uid), dataToSave, { merge: true });
    },

    // --- TASK ACTIONS ---
    addCustomTask() {
        const name = document.getElementById('task-name').value;
        const time = document.getElementById('task-time').value;
        const emoji = document.getElementById('task-emoji').value || '📍';
        if (!name || !time) return alert("Name and time required.");

        this.tasks.push({ id: Date.now(), name, time, icon: emoji, completed: false });
        this.save();
        this.haptic('light');
        this.toggleModal('custom-modal', false);
        document.getElementById('task-name').value = '';
    },

    deleteTask(id) {
        this.haptic('warning');
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
    },

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        this.tasks = this.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        if (!task.completed) this.haptic('success');
        else this.haptic('light');
        this.save();
    },

    // --- HISTORY UI ---
    showHistory() {
        this.haptic('light');
        const chartContainer = document.getElementById('chart-container');
        
        if (this.history.length === 0) {
            chartContainer.innerHTML = `<p style="color:var(--muted); padding: 20px;">No history yet. Finish today to see progress!</p>`;
        } else {
            // Reverse so latest is on the right
            chartContainer.innerHTML = [...this.history].reverse().map(entry => {
                const dayName = entry.date.split(' ')[0]; 
                return `
                    <div class="bar-wrapper">
                        <span class="bar-val">${entry.score}%</span>
                        <div class="bar" style="height: ${entry.score}%"></div>
                        <span class="bar-label">${dayName}</span>
                    </div>
                `;
            }).join('');
        }
        this.toggleModal('history-modal', true);
    },

    // --- RENDER & DYNAMICS ---
    render() {
        const list = document.getElementById('task-list');
        const scoreEl = document.getElementById('score');
        const done = this.tasks.filter(t => t.completed).length;
        const score = this.tasks.length === 0 ? 0 : Math.round((done / this.tasks.length) * 100);
        scoreEl.innerText = `Daily Score: ${score}%`;

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
                        <p>${t.time} ${isOverdue ? '<span class="overdue-tag">!</span>' : ''}</p>
                    </div>
                    <button type="button" class="delete-btn" onclick="window.app.deleteTask(${t.id})">✕</button>
                </li>
            `;
        }).join('');
        this.updateDynamicTitle();
    },

    updateDynamicTitle() {
        const titleEl = document.getElementById('dynamic-title');
        const hour = new Date().getHours();
        const done = this.tasks.filter(t => t.completed).length;
        const total = this.tasks.length;
        if (total > 0 && done === total) { titleEl.innerText = "Day Complete! 🔥"; return; }
        if (hour < 12) titleEl.innerText = "Good Morning";
        else if (hour < 18) titleEl.innerText = "Good Afternoon";
        else titleEl.innerText = "Good Evening";
    },

    updateDynamicCalendar() {
        const now = new Date();
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        document.getElementById('cal-month').innerText = months[now.getMonth()];
        document.getElementById('cal-date').innerText = now.getDate();
    },

    checkPast(time) {
        const [h, m] = time.split(':');
        const target = new Date();
        target.setHours(h, m, 0, 0);
        return new Date() > target;
    },

    changeTheme(t) {
        this.theme = t;
        document.body.className = t;
        localStorage.setItem('userTheme', t);
        this.haptic('light');
    },

    toggleModal(id, show) {
        this.haptic('light');
        document.getElementById(id).classList.toggle('hidden', !show);
    },

    applyTemplate(k) {
        const tps = {
            morning: [{name:'Hydrate', time:'07:00', icon:'💧'}, {name:'Meditate', time:'07:30', icon:'🧘'}],
            work: [{name:'Emails', time:'09:00', icon:'📧'}, {name:'Prioritize', time:'09:15', icon:'📝'}],
            health: [{name:'Vitamins', time:'08:00', icon:'💊'}, {name:'Daily Walk', time:'18:00', icon:'🚶'}]
        };
        const newTasks = tps[k].map(t => ({ ...t, id: Date.now() + Math.random(), completed: false }));
        this.tasks = [...this.tasks, ...newTasks];
        this.save();
        this.haptic('success');
        this.toggleModal('template-modal', false);
    }
};

window.app = app;
app.init();
