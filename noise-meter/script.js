const startBtn = document.getElementById('start-btn');
const sensitivityInput = document.getElementById('sensitivity');
const thresholdInput = document.getElementById('threshold');
const meterBar = document.getElementById('meter-bar');
const thresholdLine = document.getElementById('threshold-line');
const statusText = document.getElementById('status-text');
const volLevelText = document.getElementById('vol-level');

const alertOverlay = document.getElementById('alert-overlay');

const lightRed = document.getElementById('light-red');
const lightYellow = document.getElementById('light-yellow');
const lightGreen = document.getElementById('light-green');

let audioContext = null;
let analyser = null;
let microphone = null;
let isRunning = false;
let alertTimeout = null;

// Update threshold visual line
function updateThresholdLine() {
    thresholdLine.style.bottom = `${thresholdInput.value}%`;
}
thresholdInput.addEventListener('input', updateThresholdLine);
updateThresholdLine(); // Init

startBtn.addEventListener('click', async () => {
    if (isRunning) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);

        microphone.connect(analyser);
        analyser.fftSize = 512;

        isRunning = true;
        startBtn.textContent = "🎤 측정 중...";
        startBtn.disabled = true;

        measureAudio();
    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('마이크 접근 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해주세요.');
    }
});

function measureAudio() {
    if (!isRunning) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    let average = sum / bufferLength;

    // Apply sensitivity multiplier
    // Sensitivity input 0-100. Let's make it range from 0.5x to 3.0x
    const sensitivity = sensitivityInput.value;
    const multiplier = 0.5 + (sensitivity / 100 * 2.5);

    let adjustedVol = average * multiplier;

    // Normalize to 0-100 roughly (Audio is usually 0-255 but average is lower)
    // Empirically, averages hover around 10-50 for speech.
    let percentage = (adjustedVol / 100) * 100;
    if (percentage > 100) percentage = 100;
    if (percentage < 0) percentage = 0;

    // Update Meter
    meterBar.style.height = `${percentage}%`;
    volLevelText.innerText = Math.round(percentage);

    // Get Threshold
    const limit = parseInt(thresholdInput.value);

    // Check Status
    updateStatus(percentage, limit);

    requestAnimationFrame(measureAudio);
}

function updateStatus(vol, limit) {
    // Reset lights
    lightGreen.classList.remove('active');
    lightYellow.classList.remove('active');
    lightRed.classList.remove('active');

    if (vol < limit * 0.6) {
        // Green
        lightGreen.classList.add('active');
        statusText.innerText = "좋아요 😌";
        statusText.style.color = "#22c55e";
        hideAlert();
    } else if (vol < limit) {
        // Yellow
        lightYellow.classList.add('active');
        statusText.innerText = "주의해요 🤔";
        statusText.style.color = "#eab308";
        hideAlert();
    } else {
        // Red - Alert!
        lightRed.classList.add('active');
        statusText.innerText = "시끄러워요! 😡";
        statusText.style.color = "#ef4444";
        showAlert();
    }
}

function showAlert() {
    // Debounce alert to prevent flickering too much, but show instantly if high
    alertOverlay.classList.remove('hidden');

    // Auto hide after 2 seconds if volume drops, managed by hideAlert
    if (alertTimeout) clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => {
        // Force check in future? No, relies on loop.
    }, 2000);
}

function hideAlert() {
    if (!alertOverlay.classList.contains('hidden')) {
        // Introduce a small delay before hiding to ensure message is seen
        // But for responsiveness, maybe instant? user wants immediate feedback.
        // Let's instant hide for better UX if it gets quiet.
        alertOverlay.classList.add('hidden');
    }
}
