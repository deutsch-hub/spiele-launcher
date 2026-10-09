let currentSetKey = "";
let currentCards = [];
let currentCardIndex = -1;
let editingSentenceIndex = null;

function showScreen(screenId) {
  document.querySelectorAll('.metro-screen').forEach(screen => {
    screen.style.display = screen.id === screenId ? 'block' : 'none';
  });
  if (screenId === 'game-setup') {
    updateGameSetsDropdown();
  }
  if (screenId === 'editor-screen') {
    updateSetsDropdown();
  }
}

function updateGameSetsDropdown() {
  const select = document.getElementById('select-set-game');
  select.innerHTML = '';
  Object.keys(getMetroSets()).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.innerText = key;
    select.appendChild(option);
  });
  if (currentSetKey) select.value = currentSetKey;
}

function startGame() {
  const selectedSet = document.getElementById('select-set-game').value;
  const sets = getMetroSets();

  if (!selectedSet || !sets[selectedSet] || sets[selectedSet].length === 0) {
    alert('Dieses Kartenset enthält noch keine Karten.');
    return;
  }

  currentSetKey = selectedSet;
  showScreen('game-screen');
  prepareGame();
}

function prepareGame() {
  const sets = getMetroSets();
  const setKeys = Object.keys(sets).filter(key => sets[key].length > 0);
  if (setKeys.length === 0) {
    alert('Bitte füge im Editor zuerst Satz-Karten hinzu.');
    currentCards = [];
    resetCard();
    return;
  }
  const selectedSet = currentSetKey && setKeys.includes(currentSetKey) ? currentSetKey : setKeys[0];
  currentSetKey = selectedSet;
  currentCards = [...sets[selectedSet]].sort(() => Math.random() - 0.5);
  currentCardIndex = -1;
  drawSentence();
}

function drawSentence() {
  if (currentCards.length === 0) {
    prepareGame();
    return;
  }
  currentCardIndex = (currentCardIndex + 1) % currentCards.length;
  const card = currentCards[currentCardIndex];
  document.getElementById('sentence-text').innerText = card.sentence;
  document.getElementById('solution-text').innerText = card.solution;
  document.getElementById('sentence-card').classList.remove('is-flipped');
}

function resetCard() {
  document.getElementById('sentence-text').innerText = 'Ziehe eine Satz-Karte.';
  document.getElementById('solution-text').innerText = '';
  document.getElementById('sentence-card').classList.remove('is-flipped');
}

function flipCard() {
  if (currentCardIndex >= 0) {
    document.getElementById('sentence-card').classList.toggle('is-flipped');
  }
}

function updateSetsDropdown() {
  const select = document.getElementById('select-active-set');
  select.innerHTML = '<option value="">-- Bitte wählen --</option>';
  Object.keys(getMetroSets()).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.innerText = key;
    select.appendChild(option);
  });
  if (currentSetKey) select.value = currentSetKey;
  loadActiveSet();
}

function createNewSet() {
  const input = document.getElementById('new-set-name');
  const name = input.value.trim().replace(/\s+/g, '_');
  if (!name) return alert('Bitte einen Namen eingeben!');
  const sets = getMetroSets();
  if (sets[name]) return alert('Dieses Set existiert bereits!');
  sets[name] = [];
  saveMetroSets(sets);
  currentSetKey = name;
  input.value = '';
  updateSetsDropdown();
}

function loadActiveSet() {
  const selectedSetKey = document.getElementById('select-active-set').value;
  if (selectedSetKey !== currentSetKey && editingSentenceIndex !== null) {
    resetSentenceForm();
  }
  currentSetKey = selectedSetKey;
  document.getElementById('question-form-card').style.display = currentSetKey ? 'block' : 'none';
  if (currentSetKey) renderQuestionsList();
}

function addSentence(event) {
  event.preventDefault();
  const sets = getMetroSets();
  const card = {
    sentence: document.getElementById('sentence-input').value.trim(),
    solution: document.getElementById('solution-input').value.trim()
  };

  if (editingSentenceIndex === null) {
    sets[currentSetKey].push(card);
  } else {
    sets[currentSetKey][editingSentenceIndex] = card;
  }

  saveMetroSets(sets);
  resetSentenceForm();
  renderQuestionsList();
}

function editSentence(index) {
  const card = getMetroSets()[currentSetKey][index];
  if (!card) return;

  editingSentenceIndex = index;
  document.getElementById('sentence-input').value = card.sentence;
  document.getElementById('solution-input').value = card.solution;
  document.getElementById('sentence-submit-button').textContent = 'Änderungen speichern';
  document.getElementById('cancel-sentence-edit-button').hidden = false;
  document.getElementById('sentence-input').focus();
}

function cancelSentenceEdit() {
  resetSentenceForm();
}

function resetSentenceForm() {
  editingSentenceIndex = null;
  document.getElementById('question-form').reset();
  document.getElementById('sentence-submit-button').textContent = 'Satz-Karte speichern';
  document.getElementById('cancel-sentence-edit-button').hidden = true;
}

function deleteSentence(index) {
  const sets = getMetroSets();
  sets[currentSetKey].splice(index, 1);
  saveMetroSets(sets);
  if (editingSentenceIndex === index) {
    resetSentenceForm();
  } else if (editingSentenceIndex !== null && editingSentenceIndex > index) {
    editingSentenceIndex -= 1;
  }
  renderQuestionsList();
}

function renderQuestionsList() {
  const list = document.getElementById('questions-list');
  list.innerHTML = '';
  (getMetroSets()[currentSetKey] || []).forEach((card, index) => {
    const item = document.createElement('div');
    item.className = 'question-list-item';
    item.innerHTML = `<button class="question-summary" type="button" onclick="editSentence(${index})">
        <strong>${card.sentence}</strong><br>
        <span class="question-answer-hint">${card.solution}</span>
      </button>
      <button class="btn btn-secondary delete-question-btn" onclick="deleteSentence(${index})">Löschen</button>`;
    list.appendChild(item);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const requestedScreen = new URLSearchParams(window.location.search).get('screen');
  showScreen(requestedScreen === 'editor-screen' ? 'editor-screen' : 'main-menu');
});
