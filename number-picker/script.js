const maxInput = document.getElementById('max-num');
const fireBtn = document.getElementById('fire-btn');
const resetBtn = document.getElementById('reset-btn');
const resultBall = document.getElementById('result-ball');
const resultNum = document.getElementById('result-num');
const cannon = document.getElementById('cannon');

let isAnimating = false;

// Sound Effects (Simple Audio Context)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'fire') {
        // Boom sound
        osc.type = 'square'; // harsher sound
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'pop') {
        // High pitched pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }
}

fireBtn.addEventListener('click', () => {
    if (isAnimating) return;

    const max = parseInt(maxInput.value);
    if (!max || max < 1) {
        alert('올바른 번호를 입력해주세요.');
        return;
    }

    isAnimating = true;

    // 1. Reset Ball
    resultBall.classList.add('hidden');
    resultBall.classList.remove('active');

    // 2. Cannon Recoil Animation
    cannon.classList.remove('recoil');
    void cannon.offsetWidth; // trigger reflow
    cannon.classList.add('recoil');
    playSound('fire');

    // 3. Logic: Pick Number
    const luckyNum = Math.floor(Math.random() * max) + 1;
    resultNum.innerText = luckyNum;

    // 4. Show Ball after slight delay (travel time)
    setTimeout(() => {
        resultBall.classList.remove('hidden');
        // Force reflow
        void resultBall.offsetWidth;
        resultBall.classList.add('active');
        playSound('pop');
        isAnimating = false;
    }, 200);
});

resetBtn.addEventListener('click', () => {
    resultBall.classList.add('hidden');
    resultBall.classList.remove('active');
    isAnimating = false;
});
