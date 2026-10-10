let currentGameQuestions = [];
let currentQuestionIndex = 0;
const gameStartSound = new Audio('resources/wwm_spielstart.mp3');
const newQuestionSound = new Audio('resources/wwm_neuefrage.mp3');
const gameEndSound = new Audio('resources/wwm_schluss.mp3');

gameStartSound.preload = 'auto';
newQuestionSound.preload = 'auto';
gameEndSound.preload = 'auto';
gameStartSound.volume = window.getSoundVolume();
newQuestionSound.volume = window.getSoundVolume();
gameEndSound.volume = window.getSoundVolume();

function initGameSetup() {
  const sets = getQuizSets();
  const select = document.getElementById('select-set-game');
  select.innerHTML = '';
  
  const setKeys = Object.keys(sets);
  if (setKeys.length === 0) {
    alert("Bitte erstelle zuerst ein Fragenset im Editor!");
    showScreen('editor-screen');
    return;
  }

  setKeys.forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.innerText = key;
    select.appendChild(opt);
  });
}

function showScreen(screenId) {
  document.querySelectorAll('.wwm-screen').forEach(screen => {
    screen.style.display = screen.id === screenId ? 'block' : 'none';
  });
  if (screenId === 'game-setup') {
    initGameSetup();
  }
  if (screenId === 'editor-screen' && typeof updateEditorSetsDropdown === 'function') {
    updateEditorSetsDropdown();
  }
}

function launchGame() {
  const selectedSet = document.getElementById('select-set-game').value;
  const sets = getQuizSets();
  const allSetQuestions = sets[selectedSet];

  if (!allSetQuestions || allSetQuestions.length === 0) {
    alert("Dieses Set enthält noch keine Fragen!");
    return;
  }

  // Gruppieren nach Schwierigkeit & zufällig ziehen
  let grouped = {};
  allSetQuestions.forEach(q => {
    if (!grouped[q.difficulty]) grouped[q.difficulty] = [];
    grouped[q.difficulty].push(q);
  });

  currentGameQuestions = [];
  const difficulties = Object.keys(grouped).sort((a, b) => a - b);
  difficulties.forEach(diff => {
    const randomQ = grouped[diff][Math.floor(Math.random() * grouped[diff].length)];
    currentGameQuestions.push(randomQ);
  });

  currentQuestionIndex = 0;
  showScreen('game-screen');
  renderQuestion();
}

function renderQuestion() {
  const q = currentGameQuestions[currentQuestionIndex];
  const questionSound = currentQuestionIndex === 0 ? gameStartSound : newQuestionSound;
  if (window.isSoundEnabled()) {
    questionSound.currentTime = 0;
    questionSound.play().catch(error => {
      console.warn('Der Fragenton konnte nicht abgespielt werden.', error);
    });
  }

  const gameScreen = document.getElementById('game-screen');
  gameScreen.classList.remove('wwm-intro');
  gameScreen.style.removeProperty('--intro-duration');
  if (currentQuestionIndex === 0 && window.isSoundEnabled()) {
    const introDuration = Number.isFinite(gameStartSound.duration) && gameStartSound.duration > 0
      ? gameStartSound.duration * 1000
      : 5000;
    gameScreen.style.setProperty('--intro-duration', `${introDuration}ms`);
    gameScreen.classList.add('wwm-intro');
    gameScreen.querySelector('.wwm-question-content').addEventListener('animationend', () => {
      gameScreen.classList.remove('wwm-intro');
    }, { once: true });
  }

  document.getElementById('game-status').innerText = `Frage ${currentQuestionIndex + 1} von ${currentGameQuestions.length} (Schwierigkeit: Stufe ${q.difficulty})`;
  document.getElementById('question-text').innerText = q.question;
  
  ['A', 'B', 'C', 'D'].forEach(letter => {
    const btn = document.querySelector(`.wwm-answer-btn[data-letter="${letter}"]`);
    btn.disabled = false;
    btn.classList.remove('correct', 'wrong');
    document.getElementById('ans-' + letter).innerText = q.answers[letter];
  });
  document.getElementById('next-question-button').disabled = true;
}

window.addEventListener('soundpreferencechange', event => {
  if (!event.detail.enabled) {
    gameStartSound.pause();
    newQuestionSound.pause();
    gameEndSound.pause();
    const gameScreen = document.getElementById('game-screen');
    gameScreen.querySelectorAll('.wwm-logo, .wwm-question-content').forEach(element => {
      element.getAnimations().forEach(animation => animation.finish());
    });
    gameScreen.classList.remove('wwm-intro');
  }
});

window.addEventListener('soundvolumechange', event => {
  gameStartSound.volume = event.detail.volume;
  newQuestionSound.volume = event.detail.volume;
  gameEndSound.volume = event.detail.volume;
});

function finishGame() {
  const finishOverlay = document.getElementById('wwm-finish-overlay');
  finishOverlay.hidden = false;
  if (!window.isSoundEnabled()) {
    return;
  }

  gameEndSound.currentTime = 0;
  gameEndSound.onended = null;
  gameEndSound.play().catch(error => {
    console.warn('Der Schlusston konnte nicht abgespielt werden.', error);
  });
}

function checkAnswer(selectedLetter) {
  const q = currentGameQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.wwm-answer-btn');

  buttons.forEach(btn => {
    btn.disabled = true;
    const letter = btn.getAttribute('data-letter');
    if (letter === q.correct) {
      btn.classList.add('correct');
    } else if (letter === selectedLetter && selectedLetter !== q.correct) {
      btn.classList.add('wrong');
    }
  });

  const nextQuestionButton = document.getElementById('next-question-button');
  const isLastQuestion = currentQuestionIndex === currentGameQuestions.length - 1;
  nextQuestionButton.disabled = isLastQuestion;

  if (isLastQuestion) {
    finishGame();
  }
}

function nextQuestion() {
  if (document.getElementById('next-question-button').disabled) {
    return;
  }

  currentQuestionIndex++;
  if (currentQuestionIndex < currentGameQuestions.length) {
    renderQuestion();
  } else {
    finishGame();
  }
}

document.getElementById('finish-main-menu-button').addEventListener('click', () => {
  gameEndSound.pause();
  gameEndSound.onended = null;
  document.getElementById('wwm-finish-overlay').hidden = true;
  showScreen('main-menu');
});

document.addEventListener('DOMContentLoaded', () => {
  const requestedScreen = new URLSearchParams(window.location.search).get('screen');
  showScreen(requestedScreen === 'editor-screen' ? 'editor-screen' : 'main-menu');
});