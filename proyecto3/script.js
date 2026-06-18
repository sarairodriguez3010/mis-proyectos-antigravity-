const questions = [
    {
        id: 1,
        text: "Correr con tijeras",
        emoji: "🏃✂️",
        type: "peligro",
        audioText: "Correr con tijeras en la mano. ¿Es esto seguro o peligroso?"
    },
    {
        id: 2,
        text: "Recoger los juguetes",
        emoji: "🧸📦",
        type: "seguro",
        audioText: "Recoger los juguetes y guardarlos en su lugar. ¿Es esto seguro o peligroso?"
    },
    {
        id: 3,
        text: "Agua derramada",
        emoji: "💧⚠️",
        type: "peligro",
        audioText: "Dejar agua derramada en el piso donde podemos resbalar. ¿Es esto seguro o peligroso?"
    },
    {
        id: 4,
        text: "Caminar despacio",
        emoji: "🚶‍♀️🚶‍♂️",
        type: "seguro",
        audioText: "Caminar despacio por los pasillos y el salón. ¿Es esto seguro o peligroso?"
    },
    {
        id: 5,
        text: "Empujar a un compañero",
        emoji: "😠🖐️",
        type: "peligro",
        audioText: "Empujar a un compañero mientras jugamos. ¿Es esto seguro o peligroso?"
    },
    {
        id: 6,
        text: "Pedir ayuda a la maestra",
        emoji: "🙋‍♀️👩‍🏫",
        type: "seguro",
        audioText: "Pedir ayuda a la maestra si ocurre un accidente. ¿Es esto seguro o peligroso?"
    },
    {
        id: 7,
        text: "Tocar un enchufe",
        emoji: "🔌⚡",
        type: "peligro",
        audioText: "Tocar los enchufes de electricidad con las manos. ¿Es esto seguro o peligroso?"
    },
    {
        id: 8,
        text: "Sentarse bien en la silla",
        emoji: "🪑👧",
        type: "seguro",
        audioText: "Sentarse correctamente en la silla sin balancearse. ¿Es esto seguro o peligroso?"
    }
];

let currentQuestionIndex = 0;
let score = 0;
let isSpeaking = false;

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    end: document.getElementById('end-screen')
};

const elements = {
    btnStart: document.getElementById('btn-start'),
    btnRestart: document.getElementById('btn-restart'),
    btnListen: document.getElementById('btn-listen'),
    progressBar: document.getElementById('progress-bar'),
    score: document.getElementById('score'),
    finalScoreText: document.getElementById('final-score-text'),
    emojiDisplay: document.getElementById('emoji-display'),
    questionText: document.getElementById('question-text'),
    options: document.querySelectorAll('.btn-option'),
    feedbackOverlay: document.getElementById('feedback-overlay'),
    feedbackEmoji: document.getElementById('feedback-emoji'),
    feedbackText: document.getElementById('feedback-text'),
    questionCard: document.getElementById('question-card')
};

// Audio Synthesis
const synth = window.speechSynthesis;

function speak(text) {
    if (synth.speaking) {
        synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX'; // Mexican Spanish
    utterance.rate = 0.9; // Slightly slower for kids
    utterance.pitch = 1.1; // Slightly higher pitch
    
    utterance.onstart = () => isSpeaking = true;
    utterance.onend = () => isSpeaking = false;
    
    synth.speak(utterance);
}

// Game Logic
function initGame() {
    currentQuestionIndex = 0;
    score = 0;
    updateScore();
    // Shuffle questions
    questions.sort(() => Math.random() - 0.5);
    showScreen('game');
    loadQuestion();
}

function loadQuestion() {
    const question = questions[currentQuestionIndex];
    elements.emojiDisplay.textContent = question.emoji;
    elements.questionText.textContent = question.text;
    
    // Update progress bar
    const progress = (currentQuestionIndex / questions.length) * 100;
    elements.progressBar.style.width = `${progress}%`;
    
    // Speak automatically
    setTimeout(() => {
        speak(question.audioText);
    }, 500);
}

function checkAnswer(selectedType) {
    if (elements.feedbackOverlay.classList.contains('show')) return; // Prevent multiple clicks
    
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedType === question.type;
    
    if (isCorrect) {
        score++;
        updateScore();
        showFeedback(true);
        fireConfetti(true);
        speak("¡Muy bien! " + (selectedType === 'seguro' ? "Eso es seguro." : "Eso es peligroso."));
    } else {
        showFeedback(false);
        elements.questionCard.classList.add('shake');
        setTimeout(() => elements.questionCard.classList.remove('shake'), 500);
        speak("Ups, piénsalo mejor. " + (question.type === 'seguro' ? "Eso es seguro." : "Eso es peligroso."));
    }
    
    setTimeout(() => {
        elements.feedbackOverlay.classList.remove('show');
        elements.feedbackOverlay.classList.add('hidden');
        
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            endGame();
        }
    }, 2500);
}

function showFeedback(isCorrect) {
    elements.feedbackOverlay.classList.remove('hidden');
    // Force reflow
    void elements.feedbackOverlay.offsetWidth;
    elements.feedbackOverlay.classList.add('show');
    
    if (isCorrect) {
        elements.feedbackEmoji.textContent = '🌟';
        elements.feedbackText.textContent = '¡Correcto!';
        elements.feedbackText.className = 'text-success';
    } else {
        elements.feedbackEmoji.textContent = '🤔';
        elements.feedbackText.textContent = '¡Cuidado!';
        elements.feedbackText.className = 'text-error';
    }
}

function updateScore() {
    elements.score.textContent = score;
}

function endGame() {
    showScreen('end');
    elements.finalScoreText.textContent = score;
    elements.progressBar.style.width = '100%';
    
    if (score === questions.length) {
        speak("¡Felicidades! Eres un súper experto en seguridad. Encontraste todas las respuestas correctas.");
        fireBigConfetti();
    } else {
        speak(`¡Buen trabajo! Conseguiste ${score} estrellas de seguridad.`);
        fireConfetti();
    }
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenName].classList.add('active');
}

// Confetti Effects
function fireConfetti(small = false) {
    const duration = small ? 1000 : 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#38ef7d', '#11998e', '#4facfe']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#38ef7d', '#11998e', '#4facfe']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function fireBigConfetti() {
    const duration = 5000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 10,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb', '#4facfe', '#00f2fe']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Event Listeners
elements.btnStart.addEventListener('click', initGame);
elements.btnRestart.addEventListener('click', initGame);

elements.btnListen.addEventListener('click', () => {
    const question = questions[currentQuestionIndex];
    speak(question.audioText);
});

elements.options.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Prevent click if synthesis is speaking
        if(isSpeaking) synth.cancel();
        
        const type = btn.dataset.type;
        checkAnswer(type);
    });
});

// Stop audio when closing or refreshing
window.addEventListener('beforeunload', () => {
    if (synth.speaking) {
        synth.cancel();
    }
});
