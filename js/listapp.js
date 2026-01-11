/**
 * Daily Pulse - Core Logic (Firebase Integrated)
 * Project: Checklist app for Phone & Pixel Watch 4
 */

// 1. Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. Your Firebase Configuration
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
    currentUser: null,
    isSignUpMode: false,
    theme: localStorage.getItem('userTheme') || 'theme-cyber',

    init() {
        document.body.className = this.theme;
        document.getElementById('theme-selector').value = this.theme;
        
        this.updateDynamicCalendar();
        this.updateDynamicTitle();

        // AUTH LISTENER: Handles login state automatically
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

        // Overdue Check Timer (Every 30 seconds)
        setInterval(() => this.render(), 30000);
    },

    // --- AUTHENTICATION ENGINE ---
    toggleAuthMode() {
        this.isSignUpMode = !this.isSignUpMode;
        document.getElementById('auth-title').innerText = this.isSignUpMode ? "Create Account" : "Sign In";
        document.getElementById('auth-main-btn').innerText = this.isSignUpMode ? "Register" : "Sign In";
        document.getElementById('auth-toggle-link').innerText = this.isSignUpMode ? "Sign In" : "Create Account";
        document.getElementById('toggle-msg').innerText = this.isSignUpMode ? "Already have an account?" : "New here?";
    },

    async handleAuth() {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        if (!email || !pass) return alert("Please enter email and password.");

        try {
            if (this.isSignUpMode) {
                await createUserWithEmailAndPassword(auth, email, pass);
            } else {
                await signInWithEmailAndPassword(auth, email, pass);
            }
        } catch (err) {
            alert("Auth Error: " + err.message);
        }
    },

    async logout() {
        await signOut(auth);
        location.reload(); 
    },

    // --- CLOUD SYNC ENGINE ---
    listenToCloud() {
        if (!this.currentUser) return;
        // Listens for any changes in the cloud and updates the UI instantly
        onSnapshot(doc(db, "users", this.currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
                this.tasks = docSnap.data().tasks || [];
                this.render();
            }
        });
    },

    async save() {
        if (!this.currentUser) return;
        // Saves tasks to the specific User ID folder in Firestore
        await setDoc(doc(db, "users", this.currentUser.uid), {
            tasks: this.tasks,
            lastUpdated: new Date()
        });
    },

    // --- TASK MANAGEMENT ---
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

    // --- UI RENDERING ---
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
                    <span class="task-emoji">${t.icon}</span>
                    <div class="task-info">
                        <h3>${t.name}</h3>
                        <p>${t.time} ${isOverdue ? '<span class="overdue-tag">!</span>' : ''}</p>
                    </div>
                    <button class="delete-btn" onclick="window.app.deleteTask(${t.id})">✕</button>
                </li>
            `;
        }).join('');

        this.updateDynamicTitle();

    },

    // --- UTILITIES ---
    checkPast(time) {
        const [h, m] = time.split(':');
        const target = new Date();
        target.setHours(h, m, 0, 0);
        return new Date() > target;
    },

    updateDynamicCalendar() {
        const now = new Date();
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        document.getElementById('cal-month').innerText = months[now.getMonth()];
        document.getElementById('cal-date').innerText = now.getDate();
    },

    changeTheme(t) {
        this.theme = t;
        document.body.className = t;
        localStorage.setItem('userTheme', t);
    },

    toggleModal(id, show) {
        document.getElementById(id).classList.toggle('hidden', !show);
    },

    applyTemplate(k) {
        const tps = {
            morning: [{name:'Water', time:'07:00', icon:'💧'}, {name:'Meditate', time:'07:30', icon:'🧘'}],
            work: [{name:'Emails', time:'09:00', icon:'📧'}, {name:'Task List', time:'09:15', icon:'📝'}],
            health: [{name:'Vitamins', time:'08:00', icon:'💊'}, {name:'Daily Walk', time:'18:00', icon:'🚶'}]
        };
        const newTasks = tps[k].map(t => ({ ...t, id: Date.now() + Math.random(), completed: false }));
        this.tasks = [...this.tasks, ...newTasks];
        this.save();
        this.toggleModal('template-modal', false);
    }
};

// Global assignment so HTML onclicks work with Module scope
window.app = app;
app.init();

updateDynamicTitle() {
    const titleEl = document.getElementById('dynamic-title');
    const hour = new Date().getHours();
    const done = this.tasks.filter(t => t.completed).length;
    const total = this.tasks.length;
    
    // 1. Check for perfection first
    if (total > 0 && done === total) {
        titleEl.innerText = "Day Complete! 🔥";
        return;
    }

    // 2. Otherwise, time-based greetings
    if (hour < 12) {
        titleEl.innerText = "Good Morning";
    } else if (hour < 18) {
        titleEl.innerText = "Good Afternoon";
    } else {
        titleEl.innerText = "Good Evening";
    }
}

