let currentSetKey = '';
let currentQuestions = [];
let currentQuestionIndex = -1;

function showScreen(screenId) {
  document.querySelectorAll('.quiz-duell-screen').forEach(screen => {
    screen.style.display = screen.id === screenId ? 'block' : 'none';
  });

  if (screenId === 'game-setup') {
    updateGameSetsDropdown();
  }
  if (screenId === 'editor-screen') {
    updateEditorSetsDropdown();
  }
}

function updateGameSetsDropdown() {
  const select = document.getElementById('select-set-game');
  const sets = getQuizDuelSets();
  select.innerHTML = '';

  Object.keys(sets).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.innerText = key;
    select.appendChild(option);
  });

  if (currentSetKey) {
    select.value = currentSetKey;
  }
}

function startGame() {
  const selectedSet = document.getElementById('select-set-game').value;
  const sets = getQuizDuelSets();

  if (!selectedSet || !sets[selectedSet] || sets[selectedSet].length === 0) {
    alert('Dieses Fragenset enthält noch keine Fragen.');
    return;
  }

  currentSetKey = selectedSet;
  currentQuestions = [...sets[selectedSet]].sort(() => Math.random() - 0.5);
  currentQuestionIndex = -1;
  showScreen('game-screen');
  nextQuestion();
}

function nextQuestion() {
  if (currentQuestions.length === 0) {
    return;
  }

  const quizCard = document.getElementById('quiz-card');
  if (quizCard.classList.contains('is-flipped')) {
    quizCard.classList.remove('is-flipped');
    quizCard.addEventListener('transitionend', renderNextQuestion, { once: true });
    return;
  }

  renderNextQuestion();
}

function renderNextQuestion() {
  currentQuestionIndex = (currentQuestionIndex + 1) % currentQuestions.length;
  const question = currentQuestions[currentQuestionIndex];
  document.getElementById('question-text').innerText = question.question;
  document.getElementById('solution-text').innerText = question.solution;
  document.getElementById('quiz-status').innerText =
    `Frage ${currentQuestionIndex + 1} von ${currentQuestions.length}`;
}

function flipCard() {
  if (currentQuestionIndex >= 0) {
    document.getElementById('quiz-card').classList.toggle('is-flipped');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const requestedScreen = new URLSearchParams(window.location.search).get('screen');
  showScreen(requestedScreen === 'editor-screen' ? 'editor-screen' : 'main-menu');
});
