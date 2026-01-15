const input = document.getElementById('quiz-input');
const displayArea = document.getElementById('display-area');
const generateBtn = document.getElementById('generate-btn');
const answerBtn = document.getElementById('answer-btn');
const resetBtn = document.getElementById('reset-btn');

// Initial Consonants (Cho-sung)
const INITIALS = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

let currentProblem = "";
let currentAnswer = "";

function getInitialConsonant(char) {
    const code = char.charCodeAt(0);

    // Check if Hangul syllables (AC00-D7A3)
    if (code >= 0xAC00 && code <= 0xD7A3) {
        const initialIndex = Math.floor(((code - 0xAC00) / 28) / 21);
        return INITIALS[initialIndex];
    }

    // Return original char if not Hangul (e.g., spaces, numbers, punctuation)
    return char;
}

function convertText(text) {
    return text.split('').map(getInitialConsonant).join('');
}

function generateQuiz() {
    const text = input.value.trim();
    if (!text) {
        alert('단어나 문장을 입력해주세요!');
        return;
    }

    currentAnswer = text;
    currentProblem = convertText(text);

    displayArea.innerHTML = `<div class="quiz-text">${currentProblem}</div>`;

    // UI State
    generateBtn.disabled = true;
    answerBtn.disabled = false;
    input.disabled = true;
}

function showAnswer() {
    displayArea.innerHTML = `
        <div class="active-text answer-text">${currentAnswer}</div>
        <div style="font-size: 1.5rem; color: #64748b; margin-top: 1rem;">(${currentProblem})</div>
    `;
    answerBtn.disabled = true;
}

function resetQuiz() {
    input.value = "";
    input.disabled = false;
    displayArea.innerHTML = `<div class="placeholder-text">선생님이 문제를 내주세요!</div>`;

    generateBtn.disabled = false;
    answerBtn.disabled = true;

    input.focus();
}

// Event Listeners
generateBtn.addEventListener('click', generateQuiz);
answerBtn.addEventListener('click', showAnswer);
resetBtn.addEventListener('click', resetQuiz);

// Enter key support
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateQuiz();
    }
});

// Init
input.focus();
