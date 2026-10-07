let currentSetKey = "";
let currentCards = [];
let currentCardIndex = -1;

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
    document.getElementById('game-status').innerText = 'Bitte füge im Editor zuerst Satz-Karten hinzu.';
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
  document.getElementById('game-status').innerText = `Karte ${currentCardIndex + 1} von ${currentCards.length}`;
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
  currentSetKey = document.getElementById('select-active-set').value;
  document.getElementById('question-form-card').style.display = currentSetKey ? 'block' : 'none';
  if (currentSetKey) renderQuestionsList();
}

function addSentence(event) {
  event.preventDefault();
  const sets = getMetroSets();
  sets[currentSetKey].push({
    sentence: document.getElementById('sentence-input').value.trim(),
    solution: document.getElementById('solution-input').value.trim()
  });
  saveMetroSets(sets);
  document.getElementById('question-form').reset();
  renderQuestionsList();
}

function deleteSentence(index) {
  const sets = getMetroSets();
  sets[currentSetKey].splice(index, 1);
  saveMetroSets(sets);
  renderQuestionsList();
}

function renderQuestionsList() {
  const list = document.getElementById('questions-list');
  list.innerHTML = '';
  (getMetroSets()[currentSetKey] || []).forEach((card, index) => {
    const item = document.createElement('div');
    item.className = 'question-list-item';
    item.innerHTML = `<div><strong>${card.sentence}</strong><br>${card.solution}</div>
      <button class="btn btn-secondary delete-question-btn" onclick="deleteSentence(${index})">Löschen</button>`;
    list.appendChild(item);
  });
}

document.addEventListener('DOMContentLoaded', () => showScreen('main-menu'));
