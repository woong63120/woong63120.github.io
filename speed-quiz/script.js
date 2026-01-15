const timerDisplay = document.getElementById('timer-display');
const scoreDisplay = document.getElementById('score-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const settingBtn = document.getElementById('setting-btn');
const correctBtn = document.getElementById('correct-btn');
const passBtn = document.getElementById('pass-btn');

const settingsModal = document.getElementById('settings-modal');
const inputMinutes = document.getElementById('input-minutes');
const inputSeconds = document.getElementById('input-seconds');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const cancelSettingsBtn = document.getElementById('cancel-settings-btn');

const gameOverOverlay = document.getElementById('game-over-overlay');
const finalScoreDisplay = document.getElementById('final-score');
const closeOverlayBtn = document.getElementById('close-overlay-btn');

// State
let totalTime = 180; // 3 minutes default
let timeLeft = 180;
let score = 0;
let timerId = null;
let isRunning = false;

// Audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'correct') {
        // Ding! (High pitch coin sound)
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'pass') {
        // Whoosh / Slide sound (Noise based or simple slide)
        // Simple low slide
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'alarm') {
        // Siren
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(500, now + 0.3);
        osc.frequency.linearRampToValueAtTime(800, now + 0.6);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.0);
    }
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;

    // Warning state
    if (timeLeft <= 10 && timeLeft > 0) {
        timerDisplay.classList.add('warning');
    } else {
        timerDisplay.classList.remove('warning');
    }
}

function updateScoreDisplay() {
    scoreDisplay.textContent = score;
}

function gameOver() {
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    updateControls();

    // Show Overlay
    finalScoreDisplay.textContent = score;
    gameOverOverlay.classList.remove('hidden');
    playSound('alarm');
}

function tick() {
    if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
    } else {
        gameOver();
    }
}

function startTimer() {
    if (isRunning) return;
    if (timeLeft <= 0) timeLeft = totalTime; // Restart if 0

    isRunning = true;
    timerId = setInterval(tick, 1000);
    updateControls();

    // Enable game controls
    correctBtn.disabled = false;
    passBtn.disabled = false;
}

function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    updateControls();

    // Disable game controls
    correctBtn.disabled = true;
    passBtn.disabled = true;
}

function resetGame() {
    pauseTimer();
    timeLeft = totalTime;
    score = 0;
    updateTimerDisplay();
    updateScoreDisplay();
    timerDisplay.classList.remove('warning');
}

function updateControls() {
    if (isRunning) {
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        settingBtn.disabled = true;
    } else {
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        settingBtn.disabled = false;
    }
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetGame);

correctBtn.addEventListener('click', () => {
    if (!isRunning) return; // Only work when running
    score++;
    updateScoreDisplay();
    playSound('correct');
});

passBtn.addEventListener('click', () => {
    if (!isRunning) return;
    // Score doesn't change, just pass
    playSound('pass');
});

// Settings
settingBtn.addEventListener('click', () => {
    inputMinutes.value = Math.floor(totalTime / 60);
    inputSeconds.value = totalTime % 60;
    settingsModal.classList.remove('hidden');
});

cancelSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

saveSettingsBtn.addEventListener('click', () => {
    const m = parseInt(inputMinutes.value) || 0;
    const s = parseInt(inputSeconds.value) || 0;
    totalTime = (m * 60) + s;
    if (totalTime <= 0) totalTime = 60; // Min 1 min backup or 60s

    resetGame();
    settingsModal.classList.add('hidden');
});

closeOverlayBtn.addEventListener('click', () => {
    gameOverOverlay.classList.add('hidden');
    resetGame();
});

// Init
updateTimerDisplay();
correctBtn.disabled = true;
passBtn.disabled = true;
