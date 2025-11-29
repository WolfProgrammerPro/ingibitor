let maximal = 0;
let time = 0;
let answers = 0;
let uncorrect = 0;
let audioContext = null;
let sound = null;

// Initialize audio only when needed
function initializeAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        sound = document.createElement('audio');
        sound.src = 'фиксики.ogg';
        document.body.appendChild(sound);
        sound.volume = 0.2;
        sound.loop = true;
        
        // Better audio interaction handling
        const playAudio = () => {
            if (sound.paused) {
                sound.play().catch(e => console.log('Audio play failed:', e));
            }
        };
        
        document.addEventListener('click', playAudio);
        document.addEventListener('keydown', playAudio);
    }
}

setInterval(Tick, 1000);

async function Tick() {
    time++;
    const seconds = String(time % 60).padStart(2, '0');
    const minutes = Math.trunc(time / 60);
    document.getElementById('time').innerText = `${minutes}:${seconds}`;
}

// Load test data
const sharedData = localStorage.getItem('sharedData');
let data;

if (sharedData) {
    try {
        data = JSON.parse(sharedData);
        const testNumber = document.getElementById('number');
        
        if (!data.timer_was) {
            testNumber.innerText = `ТЕСТ ДО ПЕРЕРЫВА ${(data.tests?.length || 0) + 1}/3`;
        } else {
            initializeAudio();
            testNumber.innerText = `ТЕСТ ПОСЛЕ ПЕРЕРЫВА ${(data.afterTests?.length || 0) + 1}/3. МЫ ВКЛЮЧИЛИ ФОНОВЫЕ ЗВУКИ`;
        }
    } catch (error) {
        console.error('Error parsing sharedData:', error);
        // Initialize fresh data if parsing fails
        data = { tests: [], afterTests: [], timer_was: false };
    }
} else {
    // Initialize data structure if it doesn't exist
    data = { tests: [], afterTests: [], timer_was: false };
}

Next();

function Next() {
    if (maximal < 1) {
        maximal++;
        document.getElementById("find").innerText = maximal;
        
        // Create shuffled numbers array more efficiently
        const numbers = Array.from({length: 25}, (_, i) => i + 1);
        shuffleArray(numbers);
        
        // Set up buttons
        for (let i = 1; i <= 25; i++) {
            const button = document.getElementById(i.toString());
            const number = numbers[i - 1];
            
            if (button) {
                button.innerText = number;
                button.onclick = function() {
                    handleButtonClick(number);
                };
            }
        }
    } else {
        saveResultsAndRedirect();
    }
}

function handleButtonClick(number) {
    answers++;
    
    if (number === maximal) {
        Next();
    } else {
        uncorrect++;
        // Optional: Provide visual feedback for wrong answer
        const button = event.target;
        button.style.backgroundColor = '#ffcccc';
        setTimeout(() => {
            button.style.backgroundColor = '';
        }, 300);
    }
}

function saveResultsAndRedirect() {
    const testResult = new Test(time, answers, uncorrect);
    
    // Ensure arrays exist
    if (!data.tests) data.tests = [];
    if (!data.afterTests) data.afterTests = [];
    
    if (!data.timer_was) {
        data.tests.push(testResult);
    } else {
        data.afterTests.push(testResult);
    }
    
    try {
        localStorage.setItem('sharedData', JSON.stringify(data));
        document.location = 'lobby.html';
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        // Fallback: try to redirect anyway
        document.location = 'lobby.html';
    }
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Original random function (kept for compatibility)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Test {
    constructor(time, answers, uncorrect) {
        this.time = time;
        this.answers = answers;
        this.uncorrect = uncorrect;
        this.timestamp = new Date().toISOString(); // Add timestamp for better tracking
    }
}

// Clean up audio on page unload
window.addEventListener('beforeunload', () => {
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }
});
