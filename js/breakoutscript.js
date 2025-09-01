// 1. SETUP
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Game variables
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;
let score = 0;
let lives = 3;
let gameRunning = false;
let tiltControlEnabled = false;

// Brick setup
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
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
        // Paddle collision
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else { // Ball missed the paddle
            lives--;
            if (!lives) {
                alert('GAME OVER');
                document.location.reload();
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    // Paddle movement logic (only if tilt control is not active)
    if (!tiltControlEnabled) {
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
    }
    
    // Move ball
    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

// 5. CONTROLS
// Keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
}, false);

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
}, false);

// On-screen buttons
leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); leftPressed = true; }, false);
leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); leftPressed = false; }, false);
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); rightPressed = true; }, false);
rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); rightPressed = false; }, false);

// Tilt controls
function handleOrientation(event) {
    // Gamma is the left-to-right tilt
    const gamma = event.gamma;
    // Map the gamma value (-90 to 90) to the paddle's position
    // We'll use a portion of this range, e.g., -45 to 45, for full canvas width movement
    const tiltMultiplier = canvas.width / 60; // Adjust for sensitivity
    
    let newPaddleX = (canvas.width / 2) - (paddleWidth / 2) + (gamma * tiltMultiplier);

    // Clamp the paddle position to stay within the canvas
    if (newPaddleX < 0) {
        newPaddleX = 0;
    }
    if (newPaddleX > canvas.width - paddleWidth) {
        newPaddleX = canvas.width - paddleWidth;
    }
    paddleX = newPaddleX;
}


// 6. INITIALIZE GAME
startBtn.addEventListener('click', () => {
    if (gameRunning) return;
    gameRunning = true;

    // Check for DeviceOrientationEvent and request permission if needed (for iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    tiltControlEnabled = true;
                }
            })
            .catch(console.error);
    } else if ('DeviceOrientationEvent' in window) {
        // For other devices that support it without needing permission
        window.addEventListener('deviceorientation', handleOrientation);
        tiltControlEnabled = true;
    }

    startBtn.style.display = 'none';
    draw();
});
