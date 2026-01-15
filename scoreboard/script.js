const scoreboard = document.getElementById('scoreboard');
const addGroupBtn = document.getElementById('add-group-btn');
const resetAllBtn = document.getElementById('reset-all-btn');

// Colors for groups
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];

let groups = [
    { id: 1, name: '1모둠', score: 0, color: 'red' },
    { id: 2, name: '2모둠', score: 0, color: 'blue' },
    { id: 3, name: '3모둠', score: 0, color: 'yellow' },
    { id: 4, name: '4모둠', score: 0, color: 'green' },
];

// Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'up') {
        // Happy ding
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.1); // C6
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else {
        // Sad boop
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    }
}

function render() {
    scoreboard.innerHTML = '';

    if (groups.length === 0) {
        scoreboard.innerHTML = `<div class="empty-state">모둠이 없습니다. '모둠 추가' 버튼을 눌러 시작하세요!</div>`;
        return;
    }

    groups.forEach((group, index) => {
        const card = document.createElement('div');
        card.className = `group-card card-${group.color}`;

        card.innerHTML = `
            <div class="group-bg"></div>
            <button class="delete-group" onclick="removeGroup(${index})">✕</button>
            <div class="card-content">
                <input type="text" class="group-name" value="${group.name}" onchange="updateName(${index}, this.value)">
                <div class="score-display" id="score-${index}">${group.score}</div>
                <div class="score-controls">
                    <button class="score-btn minus" onclick="changeScore(${index}, -5)">-5</button>
                    <button class="score-btn minus" onclick="changeScore(${index}, -1)">-1</button>
                    <button class="score-btn plus" onclick="changeScore(${index}, 1)">+1</button>
                    <button class="score-btn plus" onclick="changeScore(${index}, 5)">+5</button>
                </div>
            </div>
        `;
        scoreboard.appendChild(card);
    });
}

// Global functions for inline events
window.changeScore = function (index, delta) {
    groups[index].score += delta;
    if (groups[index].score < 0) groups[index].score = 0; // No negative scores? or allowed? Let's fix at 0 for ease

    const scoreEl = document.getElementById(`score-${index}`);
    scoreEl.innerText = groups[index].score;

    // Animation
    scoreEl.classList.remove('pop');
    void scoreEl.offsetWidth; // trigger reflow
    scoreEl.classList.add('pop');

    playTone(delta > 0 ? 'up' : 'down');
    saveData();
};

window.updateName = function (index, newName) {
    groups[index].name = newName;
    saveData();
};

window.removeGroup = function (index) {
    if (confirm('정말 이 모둠을 삭제하시겠습니까?')) {
        groups.splice(index, 1);
        render();
        saveData();
    }
};

/* Controls */
addGroupBtn.addEventListener('click', () => {
    const nextId = groups.length + 1;
    const color = COLORS[(nextId - 1) % COLORS.length];

    groups.push({
        id: nextId,
        name: `${nextId}모둠`,
        score: 0,
        color: color
    });
    render();
    saveData();
});

resetAllBtn.addEventListener('click', () => {
    if (confirm('모든 점수를 0점으로 초기화하시겠습니까?')) {
        groups.forEach(g => g.score = 0);
        render();
        saveData();
    }
});

/* Local Storage */
function saveData() {
    localStorage.setItem('woong_scoreboard_data', JSON.stringify(groups));
}

function loadData() {
    const data = localStorage.getItem('woong_scoreboard_data');
    if (data) {
        groups = JSON.parse(data);
    }
    render();
}

// Init
loadData();
