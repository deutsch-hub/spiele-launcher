let currentSetKey = "";
let rounds = [];
let currentRound = 0;
let score = 0;
let selectedWords = [];

const wordBank = document.getElementById("word-bank");
const answerArea = document.getElementById("answer-area");
const feedback = document.getElementById("feedback");
const roundLabel = document.getElementById("round-label");
const scoreLabel = document.getElementById("score-label");
const checkButton = document.getElementById("check-button");
const resetButton = document.getElementById("reset-button");
const nextButton = document.getElementById("next-button");

function showScreen(screenId) {
  document.querySelectorAll(".puzzle-screen").forEach(screen => {
    screen.style.display = screen.id === screenId ? "block" : "none";
  });

  if (screenId === "game-setup") {
    updateGameSetsDropdown();
  }
  if (screenId === "editor-screen") {
    updateEditorSetsDropdown();
  }
}

function updateGameSetsDropdown() {
  const select = document.getElementById("select-set-game");
  select.replaceChildren();

  Object.keys(getSentenceSets()).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    select.append(option);
  });

  if (currentSetKey) {
    select.value = currentSetKey;
  }
}

function startGame() {
  const selectedSet = document.getElementById("select-set-game").value;
  const sets = getSentenceSets();

  if (!selectedSet || !sets[selectedSet] || sets[selectedSet].length === 0) {
    alert("Dieses Set enthält noch keine Sätze.");
    return;
  }

  currentSetKey = selectedSet;
  rounds = [...sets[selectedSet]].sort(() => Math.random() - 0.5);
  currentRound = 0;
  score = 0;
  showScreen("game-screen");
  renderRound();
}

function shuffle(words) {
  const shuffled = [...words];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function renderRound() {
  const words = rounds[currentRound].split(" ");
  selectedWords = [];
  wordBank.replaceChildren();
  answerArea.replaceChildren();
  feedback.textContent = "";
  feedback.className = "feedback";
  checkButton.disabled = false;
  resetButton.disabled = false;
  nextButton.hidden = true;
  roundLabel.textContent = `Satz ${currentRound + 1} von ${rounds.length}`;
  scoreLabel.textContent = `Punkte: ${score}`;

  shuffle(words).forEach((word, index) => {
    wordBank.append(createWordButton(word, index));
  });

  renderAnswer();
}

function createWordButton(word, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "word-button";
  button.textContent = word;
  button.dataset.wordIndex = index;
  button.addEventListener("click", () => selectWord(button, word, index));
  return button;
}

function selectWord(button, word, index) {
  button.remove();
  selectedWords.push({ word, index });
  renderAnswer();
}

function renderAnswer() {
  answerArea.replaceChildren();

  if (selectedWords.length === 0) {
    const placeholder = document.createElement("span");
    placeholder.className = "answer-placeholder";
    placeholder.textContent = "Klicke die Wörter in der richtigen Reihenfolge an.";
    answerArea.append(placeholder);
    return;
  }

  selectedWords.forEach(({ word }) => {
    const answerWord = document.createElement("span");
    answerWord.className = "word-button answer-word";
    answerWord.textContent = word;
    answerArea.append(answerWord);
  });
}

function resetRound() {
  renderRound();
}

function checkAnswer() {
  const answer = selectedWords.map(({ word }) => word).join(" ");
  const solution = rounds[currentRound];

  if (answer !== solution) {
    feedback.textContent = "Noch nicht richtig. Prüfe die Reihenfolge und versuche es erneut.";
    feedback.className = "feedback error";
    return;
  }

  score += 1;
  scoreLabel.textContent = `Punkte: ${score}`;
  feedback.textContent = "Richtig! Sehr gut.";
  feedback.className = "feedback success";
  checkButton.disabled = true;
  resetButton.disabled = true;

  if (currentRound === rounds.length - 1) {
    feedback.textContent += ` Du hast ${score} von ${rounds.length} Punkten erreicht.`;
    return;
  }

  nextButton.hidden = false;
}

function nextRound() {
  currentRound += 1;
  renderRound();
}

function updateEditorSetsDropdown() {
  const select = document.getElementById("select-active-set");
  select.replaceChildren();

  Object.keys(getSentenceSets()).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    select.append(option);
  });

  if (currentSetKey) {
    select.value = currentSetKey;
  }
  loadActiveSet();
}

function createNewSet() {
  const input = document.getElementById("new-set-name");
  const name = input.value.trim().replace(/\s+/g, "_");
  const sets = getSentenceSets();

  if (!name) {
    alert("Bitte einen Namen eingeben!");
    return;
  }
  if (sets[name]) {
    alert("Dieses Set existiert bereits!");
    return;
  }

  sets[name] = [];
  saveSentenceSets(sets);
  currentSetKey = name;
  input.value = "";
  updateEditorSetsDropdown();
}

function loadActiveSet() {
  currentSetKey = document.getElementById("select-active-set").value;
  document.getElementById("sentence-form-card").style.display = currentSetKey ? "block" : "none";

  if (currentSetKey) {
    renderSentencesList();
  }
}

function addSentence(event) {
  event.preventDefault();
  const input = document.getElementById("sentence-input");
  const sentence = input.value.trim();
  const sets = getSentenceSets();

  if (!sentence || !currentSetKey) {
    return;
  }

  sets[currentSetKey].push(sentence);
  saveSentenceSets(sets);
  input.value = "";
  renderSentencesList();
}

function deleteSentence(index) {
  const sets = getSentenceSets();
  sets[currentSetKey].splice(index, 1);
  saveSentenceSets(sets);
  renderSentencesList();
}

function renderSentencesList() {
  const list = document.getElementById("sentences-list");
  list.replaceChildren();

  (getSentenceSets()[currentSetKey] || []).forEach((sentence, index) => {
    const item = document.createElement("div");
    item.className = "question-list-item";

    const text = document.createElement("strong");
    text.textContent = sentence;
    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-secondary delete-question-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "Löschen";
    deleteButton.addEventListener("click", () => deleteSentence(index));

    item.append(text, deleteButton);
    list.append(item);
  });
}

checkButton.addEventListener("click", checkAnswer);
resetButton.addEventListener("click", resetRound);
nextButton.addEventListener("click", nextRound);

showScreen("main-menu");
