const timerDial = document.getElementById('timer-dial');
const timeDisplay = document.getElementById('time-display');
const inputMin = document.getElementById('input-min');
const inputSec = document.getElementById('input-sec');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const presetBtns = document.querySelectorAll('.preset-btn');

let totalTime = 600; // Default 10 mins in seconds
let currentTime = totalTime;
let timerInterval = null;
let isRunning = false;

// Audio Context for Beep
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playAlarm() {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Simple osciallator sequence
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.5); // A4

    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

    osc.start();
    osc.stop(audioCtx.currentTime + 1);
}

function updateDisplay() {
    const mins = Math.floor(currentTime / 60);
    const secs = currentTime % 60;
    timeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Update Circle
    // 360 degrees = totalTime. Current degrees = (currentTime / totalTime) * 360
    const percentage = currentTime / totalTime;
    const degrees = percentage * 360;
    timerDial.style.setProperty('--degrees', `${degrees}deg`);
}

function startTimer() {
    if (isRunning) return;

    // If starting from scratch or edited inputs
    if (currentTime === totalTime) {
        // Read inputs
        let m = parseInt(inputMin.value) || 0;
        let s = parseInt(inputSec.value) || 0;
        totalTime = m * 60 + s;
        if (totalTime <= 0) return;
        currentTime = totalTime;
    }

    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    inputMin.disabled = true;
    inputSec.disabled = true;

    timerInterval = setInterval(() => {
        currentTime--;
        updateDisplay();

        if (currentTime <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            currentTime = 0;
            updateDisplay();
            playAlarm();
            alert("⏰ 시간이 다 되었습니다!");
            resetTimer();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    startBtn.textContent = "▶ 계속";
    pauseBtn.disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    // Read current input values to reset to that
    let m = parseInt(inputMin.value) || 0;
    let s = parseInt(inputSec.value) || 0;
    totalTime = m * 60 + s;
    currentTime = totalTime;

    startBtn.disabled = false;
    startBtn.textContent = "▶ 시작";
    pauseBtn.disabled = true;
    inputMin.disabled = false;
    inputSec.disabled = false;

    updateDisplay();
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const seconds = parseInt(btn.dataset.time);
        inputMin.value = Math.floor(seconds / 60);
        inputSec.value = 0;
        resetTimer(); // Apply new time
    });
});

// Sync inputs to display initially
inputMin.addEventListener('change', resetTimer);
inputSec.addEventListener('change', resetTimer);

// Init
updateDisplay();
resetTimer();
