// ===== STATE =====
let stance = 'regular';
let isTracking = false;
let history = [];
const MAX_HISTORY = 10;

// Motion state
let motion = {
  inAir: false,
  startTime: 0,
  lastTime: 0,
  sumAlpha: 0, // Z-Axis: Spin (Shuvits)
  sumBeta: 0,  // X-Axis: End-over-end (Flips)
  sumGamma: 0  // Y-Axis: Side-to-side (Impossibles)
};

// DOM Elements
const regularBtn = document.getElementById('regularBtn');
const goofyBtn = document.getElementById('goofyBtn');
const startBtn = document.getElementById('startBtn');
const output = document.getElementById('output');
const historyEl = document.getElementById('history');
const installPrompt = document.getElementById('installPrompt');

// ===== STANCE TOGGLE =====
regularBtn.onclick = () => { stance = 'regular'; updateStance(); };
goofyBtn.onclick = () => { stance = 'goofy'; updateStance(); };

function updateStance() {
  regularBtn.classList.toggle('active', stance === 'regular');
  goofyBtn.classList.toggle('active', stance === 'goofy');
}

// ===== HISTORY MANAGEMENT =====
function addToHistory(trick) {
  const time = new Date().toLocaleTimeString('en', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });
  
  history.unshift({ trick, time });
  if (history.length > MAX_HISTORY) history.pop();
  renderHistory();
}

function renderHistory() {
  historyEl.innerHTML = history.map(h => `
    <div class="trick-item">
      <span>${h.trick}</span>
      <span class="trick-time">${h.time}</span>
    </div>
  `).join('');
}

// ===== START TRACKING =====
startBtn.onclick = async () => {
  if (isTracking) return;

  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const response = await DeviceMotionEvent.requestPermission();
      if (response !== 'granted') {
        output.textContent = 'Sensor Access Denied';
        output.style.color = 'var(--error-color)';
        return;
      }
    } catch (e) {
      output.textContent = 'Tap again to allow sensors';
      return;
    }
  }

  isTracking = true;
  startBtn.textContent = 'TRACKING ACTIVE';
  startBtn.disabled = true;
  output.textContent = 'Ready! Pop & Flip';
  output.style.color = 'var(--text-main)';
  output.classList.remove('landed');

  motion.lastTime = Date.now();
  window.addEventListener('devicemotion', handleMotion);
};

// ===== SENSOR HANDLER =====
function handleMotion(event) {
  const { rotationRate, accelerationIncludingGravity } = event;
  if (!rotationRate || !accelerationIncludingGravity) return;

  const now = Date.now();
  const dt = (now - motion.lastTime) / 1000; 
  motion.lastTime = now;

  if (dt > 0.1) return; 

  const { alpha, beta, gamma } = rotationRate; 
  const { x, y, z } = accelerationIncludingGravity;

  const accelMag = Math.sqrt(x*x + y*y + z*z);

  if (!motion.inAir) {
    if (accelMag > 15) {
      motion.inAir = true;
      motion.startTime = now;
      motion.sumAlpha = 0;
      motion.sumBeta = 0;
      motion.sumGamma = 0;
    }
  } else {
    motion.sumAlpha += alpha * dt; 
    motion.sumBeta += beta * dt;   
    motion.sumGamma += gamma * dt; 

    const timeInAir = now - motion.startTime;
    const rotSpeed = Math.sqrt(alpha*alpha + beta*beta + gamma*gamma);

    const isCaught = timeInAir > 200 && rotSpeed < 100 && accelMag > 7 && accelMag < 12;
    const isTimeout = timeInAir > 1000; 

    if (isCaught || isTimeout) {
      classifyTrick();
      motion.inAir = false;
    }
  }
}

// ===== TRICK CLASSIFICATION LOGIC =====
function classifyTrick() {
  const absAlpha = Math.abs(motion.sumAlpha); // Spin
  const absBeta = Math.abs(motion.sumBeta);   // End-over-end (Your kickflip axis)
  const absGamma = Math.abs(motion.sumGamma); // Side-to-side

  let flipCount = 0; 
  let flipDir = '';
  let shuvCount = 0; 
  
  // 1. Evaluate Flips (Beta Axis)
  if (absBeta > 130) {
    flipCount = absBeta > 450 ? 2 : 1;
    
    // Match your original code's direction logic
    if (stance === 'regular') {
      flipDir = motion.sumBeta < 0 ? 'Kickflip' : 'Heelflip';
    } else {
      flipDir = motion.sumBeta > 0 ? 'Kickflip' : 'Heelflip';
    }
  }

  // 2. Evaluate Shuvits (Alpha Axis)
  if (absAlpha > 130) {
    shuvCount = absAlpha > 260 ? 360 : 180;
  }

  // 3. Name the Trick
  let trick = 'Unknown';

  // If you roll it side-to-side, we'll call that an Impossible now
  if (absGamma > 180 && flipCount === 0 && shuvCount === 0) {
    trick = 'Impossible';
  } else if (shuvCount === 360 && flipCount === 1) {
    trick = flipDir === 'Kickflip' ? 'Tre Flip' : '360 Heelflip';
  } else if (shuvCount === 180 && flipCount === 1) {
    trick = flipDir === 'Kickflip' ? 'Varial Kickflip' : 'Varial Heelflip';
  } else if (shuvCount === 0 && flipCount === 1) {
    trick = flipDir;
  } else if (shuvCount === 0 && flipCount === 2) {
    trick = `Double ${flipDir}`;
  } else if (shuvCount > 0 && flipCount === 0) {
    trick = `${shuvCount} Shuvit`;
  } else if (absAlpha < 80 && absBeta < 80 && absGamma < 80) {
    trick = 'Ollie';
  } else {
    trick = 'Bailed'; 
  }

  // UI Updates
  output.textContent = trick.toUpperCase() + '!';
  output.classList.add('landed');
  
  if (trick !== 'Bailed' && trick !== 'Unknown') {
    addToHistory(trick);
  }

  setTimeout(() => {
    if (isTracking) {
      output.classList.remove('landed');
      output.textContent = 'Ready...';
      output.style.color = 'var(--text-main)';
    }
  }, 2000);
}

// Initialize UI
updateStance();
renderHistory();
