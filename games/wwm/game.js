let currentGameQuestions = [];
let currentQuestionIndex = 0;

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
  document.getElementById('game-status').innerText = `Frage ${currentQuestionIndex + 1} von ${currentGameQuestions.length} (Schwierigkeit: Stufe ${q.difficulty})`;
  document.getElementById('question-text').innerText = q.question;
  
  ['A', 'B', 'C', 'D'].forEach(letter => {
    const btn = document.querySelector(`.wwm-answer-btn[data-letter="${letter}"]`);
    btn.classList.remove('correct', 'wrong');
    document.getElementById('ans-' + letter).innerText = q.answers[letter];
  });
}

function checkAnswer(selectedLetter) {
  const q = currentGameQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll('.wwm-answer-btn');

  buttons.forEach(btn => {
    const letter = btn.getAttribute('data-letter');
    if (letter === q.correct) {
      btn.classList.add('correct');
    } else if (letter === selectedLetter && selectedLetter !== q.correct) {
      btn.classList.add('wrong');
    }
  });

  setTimeout(() => {
    if (selectedLetter === q.correct) {
      currentQuestionIndex++;
      if (currentQuestionIndex < currentGameQuestions.length) {
        renderQuestion();
      } else {
        alert("🎉 HERZLICHEN GLÜCKWUNSCH! Du hast alle Fragen richtig beantwortet!");
        showScreen('main-menu');
      }
    } else {
      alert("Leider falsch! Das Spiel ist vorbei.");
      showScreen('main-menu');
    }
  }, 1500);
}

document.addEventListener('DOMContentLoaded', () => showScreen('main-menu'));