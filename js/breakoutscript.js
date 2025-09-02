// 1. SETUP
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Game variables
let ballRadius = 10;
let x, y, dx, dy; // Will be reset
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX; // Will be reset
let rightPressed = false;
let leftPressed = false;
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;
let score; // Will be reset
let lives; // Will be reset
let gameRunning = false;
let motionDetected = false; // **FIX**: This new flag tracks if the user is actually tilting

// Brick setup
let bricks = [];

function setupBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// Function to reset the game state
function resetGame() {
    score = 0;
    lives = 3;
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    setupBricks();
}

// 2. DRAWING FUNCTIONS
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`Score: ${score}`, 8, 20);
}

function drawLives() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

// 3. GAME LOGIC & COLLISION
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if (score === brickRowCount * brickColumnCount) {
                        alert('YOU WIN, CONGRATULATIONS!');
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// 4. MAIN GAME LOOP
function draw() {
    if (!gameRunning) return; // Stop the loop if game is over

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    // Wall collision (left/right)
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }

    // Wall collision (top)
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (!lives) {
                gameRunning = false;
                alert('GAME OVER');
                document.location.reload();
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    // **FIX**: Use the `motionDetected` flag to decide which control scheme to use
    if (!motionDetected) {
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
    }
    
    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

// 5. CONTROLS
document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
}, false);

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
}, false);

leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); leftPressed = true; }, { passive: false });
leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); leftPressed = false; }, { passive: false });
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); rightPressed = true; }, { passive: false });
rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); rightPressed = false; }, { passive: false });


function handleOrientation(event) {
    // **FIX**: If the device is tilted significantly, switch to motion controls
    if (event.gamma !== null && (event.gamma > 5 || event.gamma < -5)) {
        motionDetected = true;
    }
    
    // Only move paddle if motion controls are active
    if (motionDetected) {
        const gamma = event.gamma; // Left-to-right tilt
        const tiltMultiplier = canvas.width / 60; // Sensitivity
        let newPaddleX = (canvas.width / 2) - (paddleWidth / 2) + (gamma * tiltMultiplier);

        // Clamp paddle position
        if (newPaddleX < 0) newPaddleX = 0;
        if (newPaddleX > canvas.width - paddleWidth) newPaddleX = canvas.width - paddleWidth;
        paddleX = newPaddleX;
    }
}


// 6. INITIALIZE GAME
startBtn.addEventListener('click', () => {
    if (gameRunning) return;

    // Request permission for motion events on iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            })
            .catch(console.error);
    } else if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', handleOrientation);
    }

    startBtn.style.display = 'none';
    resetGame(); // Set initial positions, score, and lives
    gameRunning = true;
    draw(); // Start the animation loop
});
