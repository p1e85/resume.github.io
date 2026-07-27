// ===== STATE =====
let stance = 'regular';
let isTracking = false;
let history = [];
const MAX_HISTORY = 10;

// Motion state
let motion = {
  active: false,
  axis: null,
  startTime: 0,
  rotSum: 0,
  pop: false,
  lastHighRot: 0
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
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
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
      console.error(e);
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

  // Show iOS install prompt if applicable
  if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !window.navigator.standalone) {
    installPrompt.style.display = 'block';
  }

  window.addEventListener('devicemotion', handleMotion);
};

// ===== SENSOR HANDLER =====
function handleMotion(event) {
  const { rotationRate, accelerationIncludingGravity } = event;
  if (!rotationRate) return;

  const now = Date.now();
  const alpha = rotationRate.alpha || 0;
  const beta = rotationRate.beta || 0;

  // Pop detection (Z-axis spike)
  if (accelerationIncludingGravity && accelerationIncludingGravity.z > 12) {
    motion.pop = true;
  }

  const absAlpha = Math.abs(alpha);
  const absBeta = Math.abs(beta);

  let dominantAxis = null;
  if (absBeta > 90) dominantAxis = 'beta';       // kickflip/heelflip axis
  else if (absAlpha > 90) dominantAxis = 'alpha'; // shuvit axis

  // Start evaluating a new trick motion
  if (dominantAxis && !motion.active) {
    motion.active = true;
    motion.axis = dominantAxis;
    motion.startTime = now;
    motion.rotSum = 0;
    motion.pop = false;
    motion.lastHighRot = now;
    return;
  }

  // Accumulate rotation
  if (dominantAxis === motion.axis) {
    const rate = motion.axis === 'beta' ? beta : alpha;
    const dt = now - motion.lastHighRot;
    motion.rotSum += rate * (dt / 1000);
    motion.lastHighRot = now;
  }

  // Finalize trick after 350ms of quiet time (motion stopped)
  if (motion.active && (now - motion.lastHighRot > 350)) {
    classifyTrick();
  }
}

// ===== TRICK CLASSIFICATION =====
function classifyTrick() {
  if (!motion.active) return;

  const totalDeg = Math.abs(motion.rotSum);
  const direction = motion.rotSum > 0 ? 1 : -1;
  
  const full = totalDeg > 320;
  const threeQ = totalDeg > 240;
  const half = totalDeg > 150;
  const quarter = totalDeg > 80;

  let trick = 'Bailed';

  // Flip axis
  if (motion.axis === 'beta') {
    if (full) {
      const isKickflip = (stance === 'regular' && direction < 0) || (stance === 'goofy' && direction > 0);
      trick = isKickflip ? 'Kickflip' : 'Heelflip';
    } else if (threeQ) {
      const isKickflip = (stance === 'regular' && direction < 0) || (stance === 'goofy' && direction > 0);
      trick = isKickflip ? 'Varial Kickflip' : 'Varial Heelflip';
    } else if (half) {
      trick = 'Half-Flip';
    } else if (motion.pop) {
      trick = 'Impossible';
    }
  } 
  // Shuv axis
  else if (motion.axis === 'alpha') {
    if (full) {
      trick = motion.pop ? '360 Flip' : '360 Shuvit';
    } else if (half) {
      trick = '180 Shuvit';
    } else if (quarter) {
      trick = 'Shuvit';
    }
  }

  // Overwrite if it was just a pop with minimal rotation
  if (motion.pop && totalDeg < 100) trick = 'Ollie';

  // UI Updates for landed trick
  output.textContent = trick.toUpperCase() + '!';
  output.classList.add('landed');
  
  if (trick !== 'Bailed') {
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

  // Reset state variables
  motion = { active: false, axis: null, startTime: 0, rotSum: 0, pop: false, lastHighRot: 0 };
}

// Initialize UI
updateStance();
renderHistory();
