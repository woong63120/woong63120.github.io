const revealBtn = document.getElementById('reveal-btn');
const resetBtn = document.getElementById('reset-btn');
const answerOverlay = document.getElementById('answer-overlay');
const answerMark = document.getElementById('answer-mark');
const answerInputs = document.querySelectorAll('input[name="answer"]');

// Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'O') {
        // Ding Dong (C5 - E5)
        const now = audioCtx.currentTime;

        // Ding
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.5, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc1.start(now);
        osc1.stop(now + 0.5);

        // Dong
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(659.25, now + 0.4);
        gain2.gain.setValueAtTime(0.5, now + 0.4);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
        osc2.start(now + 0.4);
        osc2.stop(now + 1.2);

    } else {
        // Buzzer (Sawtooth low drop)
        const now = audioCtx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.5);

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);
    }
}

revealBtn.addEventListener('click', () => {
    // Get selected answer
    let selected = null;
    for (const input of answerInputs) {
        if (input.checked) {
            selected = input.value;
            break;
        }
    }

    if (!selected) {
        alert('⭕ 또는 ❌ 정답을 먼저 선택해주세요! (하단 버튼)');
        return;
    }

    // Show Overlay
    answerMark.className = 'mark'; // Reset
    if (selected === 'O') {
        answerMark.classList.add('circle');
        playSound('O');
    } else {
        answerMark.classList.add('cross');
        playSound('X');
    }

    answerOverlay.classList.remove('hidden');

    // Add specific animation class again to trigger reflow if needed, 
    // but hidden toggle handles it nicely with css animation.
});

resetBtn.addEventListener('click', () => {
    answerOverlay.classList.add('hidden');
    // We do NOT clear the text, as teachers might want to retry.
    // We keep the selection as well.
});

// Click on overlay to dismiss
answerOverlay.addEventListener('click', () => {
    answerOverlay.classList.add('hidden');
});
