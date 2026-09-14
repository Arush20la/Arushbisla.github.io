// --- 1. Background Particle Constellation ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const particles = Array.from({ length: 40 }, () => ({
  x: Math.random() * width,
  y: Math.random() * height,
  vx: (Math.random() - 0.5) * 0.5,
  vy: (Math.random() - 0.5) * 0.5,
  radius: Math.random() * 1.5 + 0.5
}));

function animateBackground() {
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.1 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateBackground);
}
animateBackground();

// --- 2. Classic Brick Breaker Logic ---
const gameCanvas = document.getElementById('mini-game');
const gCtx = gameCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const statusEl = document.getElementById('game-status');
const startBtn = document.getElementById('start-game-btn');

let animationId;
let isPlaying = false;

// Game State
let score = 0;
let lives = 3;

// Ball
const ballRadius = 5;
let x = gameCanvas.width / 2;
let y = gameCanvas.height - 30;
let dx = 3;
let dy = -3;

// Paddle
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (gameCanvas.width - paddleWidth) / 2;

// Controls
let rightPressed = false;
let leftPressed = false;

// Bricks (7 columns x 5 rows to fit 400px width nicely)
const brickRowCount = 5;
const brickColumnCount = 7;
const brickWidth = 45;
const brickHeight = 15;
const brickPadding = 8;
const brickOffsetTop = 30;
const brickOffsetLeft = 18.5;
let bricks = [];

// Event Listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
startBtn.addEventListener('click', () => { if (!isPlaying) initGame(); });

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") { rightPressed = true; }
  else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { leftPressed = true; }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") { rightPressed = false; }
  else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { leftPressed = false; }
}

function initBricks() {
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score += 10;
          scoreEl.textContent = score;
          
          if (score === brickRowCount * brickColumnCount * 10) {
            statusEl.textContent = "YOU WIN!";
            statusEl.style.color = "#34d399";
            isPlaying = false;
            cancelAnimationFrame(animationId);
          }
        }
      }
    }
  }
}

function drawBall() {
  gCtx.beginPath();
  gCtx.arc(x, y, ballRadius, 0, Math.PI * 2);
  gCtx.fillStyle = "#ffffff";
  gCtx.fill();
  gCtx.closePath();
}

function drawPaddle() {
  gCtx.beginPath();
  gCtx.rect(paddleX, gameCanvas.height - paddleHeight, paddleWidth, paddleHeight);
  gCtx.fillStyle = "#2563eb"; // Classic Blue Paddle
  gCtx.fill();
  gCtx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        
        gCtx.beginPath();
        gCtx.rect(brickX, brickY, brickWidth, brickHeight);
        gCtx.fillStyle = "#b91c1c"; // Classic Dark Red Bricks
        gCtx.strokeStyle = "#450a0a";
        gCtx.lineWidth = 2;
        gCtx.fill();
        gCtx.stroke();
        gCtx.closePath();
      }
    }
  }
}

function draw() {
  gCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  
  // Custom light grey background like the classic game
  gCtx.fillStyle = "#e2e8f0";
  gCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  // Wall collision (Left/Right)
  if (x + dx > gameCanvas.width - ballRadius || x + dx < ballRadius) { dx = -dx; }
  
  // Wall collision (Top)
  if (y + dy < ballRadius) { dy = -dy; }
  // Paddle / Bottom collision
  else if (y + dy > gameCanvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      // Add slight angle variance based on where it hits the paddle
      let hitPoint = x - (paddleX + paddleWidth / 2);
      dx = hitPoint * 0.15;
      dy = -dy;
    } else {
      lives--;
      livesEl.textContent = lives;
      if (!lives) {
        statusEl.textContent = "GAME OVER";
        statusEl.style.color = "#f87171";
        isPlaying = false;
        return;
      } else {
        // Reset position
        x = gameCanvas.width / 2;
        y = gameCanvas.height - 30;
        dx = 3;
        dy = -3;
        paddleX = (gameCanvas.width - paddleWidth) / 2;
      }
    }
  }

  // Move paddle
  if (rightPressed && paddleX < gameCanvas.width - paddleWidth) { paddleX += 5; }
  else if (leftPressed && paddleX > 0) { paddleX -= 5; }

  x += dx;
  y += dy;

  if (isPlaying) {
    animationId = requestAnimationFrame(draw);
  }
}

function initGame() {
  isPlaying = true;
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  statusEl.textContent = "Playing...";
  statusEl.style.color = "#38bdf8";
  startBtn.textContent = "Restart Game";
  
  x = gameCanvas.width / 2;
  y = gameCanvas.height - 30;
  dx = 3;
  dy = -3;
  paddleX = (gameCanvas.width - paddleWidth) / 2;
  
  initBricks();
  cancelAnimationFrame(animationId);
  draw();
}

// Initial draw before starting
gCtx.fillStyle = "#e2e8f0";
gCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
initBricks();
drawBricks();
drawPaddle();
