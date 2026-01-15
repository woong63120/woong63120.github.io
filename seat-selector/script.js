// DOM Elements
const nameInput = document.getElementById('name-input');
const resetBtn = document.getElementById('reset-btn');
const loadSampleBtn = document.getElementById('load-sample-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const seatGrid = document.getElementById('seat-grid');
const loadingShroud = document.getElementById('loading-shroud');

let currentMode = 'general';
let students = [];

// Event Listeners
resetBtn.addEventListener('click', () => {
    nameInput.value = '';
    students = [];
    renderEmpty();
});

loadSampleBtn.addEventListener('click', () => {
    const sample = [];
    for (let i = 1; i <= 24; i++) {
        sample.push(`${i}. 학생${i}`);
    }
    nameInput.value = sample.join('\n');
});

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;

        // Update grid class
        seatGrid.className = 'seat-grid'; // Reset
        seatGrid.classList.add(`layout-${currentMode}`);

        // Re-render if we already have students
        if (students.length > 0) {
            renderSeats(students);
        }
    });
});

shuffleBtn.addEventListener('click', () => {
    const rawInput = nameInput.value.trim();
    if (!rawInput) {
        alert('학생 명단을 입력해주세요!');
        return;
    }

    // Processing Logic
    loadingShroud.classList.remove('hidden');

    setTimeout(() => {
        students = processInput(rawInput);
        students = shuffleArray(students);
        renderSeats(students);
        loadingShroud.classList.add('hidden');
    }, 800); // Fake processing delay for effect
});

// Helper Functions
function processInput(text) {
    // Split by new line, trim, and filter empties
    return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            // Remove leading numbers (e.g., "1. Name" -> "Name")
            return line.replace(/^[\d]+\.?\s*/, '');
        });
}

function shuffleArray(array) {
    const arr = [...array]; // Copy
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function renderSeats(names) {
    seatGrid.innerHTML = '';

    if (currentMode === 'general') {
        renderGeneral(names);
    } else if (currentMode === 'group') {
        renderGroup(names);
    } else if (currentMode === 'discussion') {
        renderDiscussion(names);
    }
}

function createSeat(name, index) {
    const div = document.createElement('div');
    div.className = 'seat filled';
    div.innerText = name;
    // Staggered animation
    div.style.animationDelay = `${index * 0.05}s`;
    return div;
}

// Layout Renderers
function renderGeneral(names) {
    // Determine columns based on count (approx rows)
    // Default styles handle 6 cols, but if few students, we can adjust? 
    // For now, keep simple grid.
    names.forEach((name, i) => {
        seatGrid.appendChild(createSeat(name, i));
    });
}

function renderGroup(names) {
    // 4 to 6 students per group
    const groupSize = 4; // Default to 4 for now
    let currentGroup = document.createElement('div');
    currentGroup.className = 'group-cluster';

    names.forEach((name, i) => {
        if (i > 0 && i % groupSize === 0) {
            seatGrid.appendChild(currentGroup);
            currentGroup = document.createElement('div');
            currentGroup.className = 'group-cluster';
        }
        currentGroup.appendChild(createSeat(name, i));
    });
    // Append last group
    seatGrid.appendChild(currentGroup);
}

function renderDiscussion(names) {
    // Split into Left Side vs Right Side
    const mid = Math.ceil(names.length / 2);
    const leftTeam = names.slice(0, mid);
    const rightTeam = names.slice(mid);

    const leftSide = document.createElement('div');
    leftSide.className = 'discussion-side';
    leftSide.innerHTML = '<h4>Team A</h4><div class="discussion-table"></div>';

    const rightSide = document.createElement('div');
    rightSide.className = 'discussion-side';
    rightSide.innerHTML = '<h4>Team B</h4><div class="discussion-table"></div>';

    const leftContainer = leftSide.querySelector('.discussion-table');
    const rightContainer = rightSide.querySelector('.discussion-table');

    leftTeam.forEach((name, i) => leftContainer.appendChild(createSeat(name, i)));
    rightTeam.forEach((name, i) => rightContainer.appendChild(createSeat(name, i)));

    seatGrid.appendChild(leftSide);
    seatGrid.appendChild(rightSide);
}

function renderEmpty() {
    seatGrid.innerHTML = '<div class="empty-state">학생 명단을 입력하고 배치를 시작해보세요!</div>';
}
