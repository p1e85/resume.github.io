// ===== STATE =====
let stance = 'regular';
let isTracking = false;
let history = [];
const MAX_HISTORY = 10;

// Upgraded Motion State
let motion = {
  inAir: false,
  startTime: 0,
  lastTime: 0,
  sumAlpha: 0, // Yaw (Shuvits)
  sumBeta: 0,  // Pitch (Impossibles)
  sumGamma: 0  // Roll (Kickflips/Heelflips)
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

  // iOS permission requirement for device motion
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

  // Reset timing
  motion.lastTime = Date.now();
  window.addEventListener('devicemotion', handleMotion);
};

// ===== SENSOR HANDLER =====
function handleMotion(event) {
  const { rotationRate, accelerationIncludingGravity } = event;
  if (!rotationRate || !accelerationIncludingGravity) return;

  const now = Date.now();
  const dt = (now - motion.lastTime) / 1000; // Time delta in seconds
  motion.lastTime = now;

  // Prevent massive jumps if the app lags or goes to the background
  if (dt > 0.1) return; 

  const { alpha, beta, gamma } = rotationRate; 
  const { x, y, z } = accelerationIncludingGravity;

  // Calculate total acceleration magnitude (Gravity is ~9.8)
  const accelMag = Math.sqrt(x*x + y*y + z*z);

  if (!motion.inAir) {
    // 1. POP DETECTION
    // A sudden spike in overall acceleration implies a pop/snap
    if (accelMag > 15) {
      motion.inAir = true;
      motion.startTime = now;
      motion.sumAlpha = 0;
      motion.sumBeta = 0;
      motion.sumGamma = 0;
    }
  } else {
    // 2. IN-AIR TRACKING
    // Accumulate total degrees of rotation on all 3 axes
    motion.sumAlpha += alpha * dt; // Shuvit axis
    motion.sumBeta += beta * dt;   // Impossible axis
    motion.sumGamma += gamma * dt; // Kickflip axis

    const timeInAir = now - motion.startTime;
    
    // Check total rotation speed to see if the phone has "calmed down" (caught/landed)
    const rotSpeed = Math.sqrt(alpha*alpha + beta*beta + gamma*gamma);

    // 3. LANDING DETECTION
    // If we've been in the air for at least 200ms, the rotation stops, and gravity returns to normal (~9.8)
    const isCaught = timeInAir > 200 && rotSpeed < 100 && accelMag > 7 && accelMag < 12;
    const isTimeout = timeInAir > 1000; // Max 1 second trick time

    if (isCaught || isTimeout) {
      classifyTrick();
      motion.inAir = false;
    }
  }
}

// ===== TRICK CLASSIFICATION LOGIC =====
function classifyTrick() {
  const absAlpha = Math.abs(motion.sumAlpha); // Yaw / Shuv
  const absBeta = Math.abs(motion.sumBeta);   // Pitch / Impossible
  const absGamma = Math.abs(motion.sumGamma); // Roll / Flip

  let flipCount = 0; // 0 = none, 1 = single, 2 = double
  let flipDir = '';
  let shuvCount = 0; // 0 = none, 180, 360
  
  // 1. Evaluate Flips (Gamma Axis)
  if (absGamma > 130) {
    flipCount = absGamma > 450 ? 2 : 1;
    
    // Determine Kickflip vs Heelflip based on stance and rotation direction
    if (stance === 'regular') {
      flipDir = motion.sumGamma > 0 ? 'Kickflip' : 'Heelflip';
    } else {
      flipDir = motion.sumGamma < 0 ? 'Kickflip' : 'Heelflip';
    }
  }

  // 2. Evaluate Shuvits (Alpha Axis)
  if (absAlpha > 130) {
    shuvCount = absAlpha > 260 ? 360 : 180;
  }

  // 3. Name the Trick
  let trick = 'Unknown';

  if (absBeta > 250 && flipCount === 0 && shuvCount === 0) {
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
  } else if (absAlpha < 60 && absGamma < 60 && absBeta < 60) {
    trick = 'Ollie';
  } else {
    trick = 'Bailed'; // Too chaotic to classify cleanly
  }

  // UI Updates
  output.textContent = trick.toUpperCase() + '!';
  output.classList.add('landed');
  
  if (trick !== 'Bailed' && trick !== 'Unknown') {
    addToHistory(trick);
  }

  // Reset UI after 2 seconds
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
