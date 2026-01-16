// Main entry point for the portfolio
console.log("Welcome to Woong's Portfolio!");

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// --- Dashboard Features ---

// 1. Date & Time
function updateDateTime() {
    const now = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

    document.getElementById('current-date').textContent = now.toLocaleDateString('ko-KR', dateOptions);
    document.getElementById('current-time').textContent = now.toLocaleTimeString('ko-KR', timeOptions);
}
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call

// 2. Today's Quote
const quotes = [
    { text: "배움은 우연히 얻어지는 것이 아니라, 열정을 다해 갈구하고 부지런히 집중해야 얻을 수 있는 것이다.", author: "애비게일 아담스" },
    { text: "교육은 세상을 바꿀 수 있는 가장 강력한 무기이다.", author: "넬슨 만델라" },
    { text: "천재는 1%의 영감과 99%의 땀으로 만들어진다.", author: "토머스 에디슨" },
    { text: "실패는 성공을 위한 디딤돌이다.", author: "미상" },
    { text: "오늘 걷지 않으면 내일은 뛰어야 한다.", author: "프로버브" },
    { text: "중요한 것은 꺾이지 않는 마음이다.", author: "데프트" },
    { text: "꿈을 꿀 수 있다면, 그 꿈을 이룰 수도 있다.", author: "월트 디즈니" },
    { text: "시작이 반이다.", author: "한국 속담" }
];

function setRandomQuote() {
    const today = new Date().getDate();
    // Use the date as a seed or just random? Let's go simple random for now to keep it fresh on refresh.
    // Or maybe deterministic based on day? random is more fun.
    const randomIndex = Math.floor(Math.random() * quotes.length);
    document.getElementById('quote-text').textContent = `"${quotes[randomIndex].text}"`;
    document.getElementById('quote-author').textContent = `- ${quotes[randomIndex].author}`;
}
setRandomQuote();

// 3. Weather Widget (Open-Meteo API)
const cityCoords = {
    seoul: { lat: 37.5665, lon: 126.9780 },
    busan: { lat: 35.1796, lon: 129.0756 },
    incheon: { lat: 37.4563, lon: 126.7052 },
    daegu: { lat: 35.8714, lon: 128.6014 },
    daejeon: { lat: 36.3504, lon: 127.3845 },
    gwangju: { lat: 35.1595, lon: 126.8526 },
    ulsan: { lat: 35.5384, lon: 129.3114 },
    jeju: { lat: 33.4996, lon: 126.5312 }
};

const weatherCodes = {
    0: '☀️ 맑음',
    1: '🌤️ 대체로 맑음',
    2: '⛅ 흐림',
    3: '☁️ 매우 흐림',
    45: '🌫️ 안개',
    48: '🌫️ 안개',
    51: '​​​​​​🌧️ 이슬비',
    53: '🌧️ 이슬비',
    55: '🌧️ 이슬비',
    61: '☔ 비',
    63: '☔ 비',
    65: '☔ 비',
    71: '☃️ 눈',
    73: '☃️ 눈',
    75: '☃️ 눈',
    95: '⛈️ 천둥번개',
    96: '⛈️ 천둥번개',
    99: '⛈️ 천둥번개'
};

/* 
   Weather Codes (WMO):
   0: Clear sky
   1, 2, 3: Mainly clear, partly cloudy, and overcast
   45, 48: Fog
   51, 53, 55: Drizzle
   61, 63, 65: Rain
   71, 73, 75: Snow fall
   95, 96, 99: Thunderstorm
*/

async function fetchWeather(cityKey) {
    const coords = cityCoords[cityKey];
    if (!coords) return;

    const weatherInfoDiv = document.getElementById('weather-info');
    const tempDiv = document.getElementById('weather-temp');
    const descDiv = document.getElementById('weather-desc');
    const iconDiv = document.getElementById('weather-icon');

    // Loading state logic could go here if needed
    // descDiv.textContent = "로딩 중...";

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();

        const temp = data.current_weather.temperature;
        const code = data.current_weather.weathercode;
        const desc = weatherCodes[code] || '알 수 없음';

        tempDiv.textContent = `${temp}°C`;
        descDiv.textContent = desc;
        iconDiv.textContent = desc.split(' ')[0]; // Emoticon only
        iconDiv.style.fontSize = "3rem";

    } catch (error) {
        console.error("Weather fetch failed:", error);
        descDiv.textContent = "날씨 정보 실패";
    }
}

const citySelect = document.getElementById('city-select');

// Load saved city
const savedCity = localStorage.getItem('selectedCity') || 'seoul';
citySelect.value = savedCity;
fetchWeather(savedCity);

citySelect.addEventListener('change', (e) => {
    const selectedCity = e.target.value;
    localStorage.setItem('selectedCity', selectedCity);
    fetchWeather(selectedCity);
});


// 4. Vacation Countdown
const countdownDisplay = document.getElementById('countdown-display');
const setDateBtn = document.getElementById('set-date-btn');

function updateCountdown() {
    const targetDateStr = localStorage.getItem('targetDate');

    if (!targetDateStr) {
        countdownDisplay.textContent = "날짜를 설정하세요";
        countdownDisplay.style.fontSize = "1.2rem";
        return;
    }

    const now = new Date();
    const target = new Date(targetDateStr);

    // Reset time to midnight for accurate day calculation
    const nowReset = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetReset = new Date(target.getFullYear(), target.getMonth(), target.getDate());

    const diffTime = targetReset - nowReset;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
        countdownDisplay.textContent = `D-${diffDays}`;
    } else if (diffDays === 0) {
        countdownDisplay.textContent = `D-Day!`;
    } else {
        countdownDisplay.textContent = `D+${Math.abs(diffDays)}`;
    }
    countdownDisplay.style.fontSize = "2.5rem";
}

const targetDatePicker = document.getElementById('target-date-picker');

setDateBtn.addEventListener('click', () => {
    // Show the date picker
    if ('showPicker' in HTMLInputElement.prototype) {
        targetDatePicker.showPicker();
    } else {
        targetDatePicker.click();
    }
});

targetDatePicker.addEventListener('change', (e) => {
    const newDate = e.target.value;
    if (newDate) {
        localStorage.setItem('targetDate', newDate);
        updateCountdown();
    }
});

updateCountdown(); // Initial call
