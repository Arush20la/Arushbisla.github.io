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


// --- 2. Exclusive Mini-Game Logic ("Bug Catcher: SAU Code Rush") ---
const gameCanvas = document.getElementById('mini-game');
const gCtx = gameCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('game-status');
const startBtn = document.getElementById('start-game-btn');

let gameInterval;
let score = 0;
let isPlaying = false;

let player = { x: 175, y: 260, width: 50, height: 16, speed: 6, dx: 0 };
let bugs = [];

let keys = { ArrowLeft: false, ArrowRight: false, KeyA: false, KeyD: false };

window.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
});

window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
});

startBtn.addEventListener('click', () => {
  if (!isPlaying) startGame();
});

function startGame() {
  isPlaying = true;
  score = 0;
  scoreEl.textContent = score;
  statusEl.textContent = "Playing...";
  startBtn.textContent = "Restart Game";
  bugs = [];
  
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(updateGame, 1000 / 60);
}

function updateGame() {
  gCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Player movement
  if (keys.left && player.x > 0) player.x -= player.speed;
  if (keys.right && player.x + player.width < gameCanvas.width) player.x += player.speed;

  // Draw Player (Terminal Paddle)
  gCtx.fillStyle = '#38bdf8';
  gCtx.fillRect(player.x, player.y, player.width, player.height);

  // Spawn bugs randomly
  if (Math.random() < 0.03) {
    bugs.push({
      x: Math.random() * (gameCanvas.width - 20),
      y: 0,
      size: 16,
      speed: 2 + Math.random() * 2
    });
  }

  // Update & Draw Bugs
  for (let i = bugs.length - 1; i >= 0; i--) {
    let bug = bugs[i];
    bug.y += bug.speed;

    // Draw Bug Icon
    gCtx.fillStyle = '#f43f5e';
    gCtx.beginPath();
    gCtx.arc(bug.x + 8, bug.y + 8, 8, 0, Math.PI * 2);
    gCtx.fill();

    // Collision check
    if (
      bug.x + 16 > player.x &&
      bug.x < player.x + player.width &&
      bug.y + 16 > player.y &&
      bug.y < player.y + player.height
    ) {
      bugs.splice(i, 1);
      score += 10;
      scoreEl.textContent = score;
    } else if (bug.y > gameCanvas.height) {
      bugs.splice(i, 1);
    }
  }

  // Win condition / Game loop continuous
}
