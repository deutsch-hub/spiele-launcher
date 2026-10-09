const values = [100, 200, 300, 400, 500];
const modal = document.getElementById("question-modal");
const teamCount = document.getElementById("team-count");
const teamFields = document.getElementById("team-fields");
const setSelect = document.getElementById("select-set-game");
const activeSetSelect = document.getElementById("select-active-set");
const categoryEditor = document.getElementById("category-editor");
const categoriesList = document.getElementById("categories-list");
const scoreboard = document.getElementById("scoreboard");
const gameBoard = document.getElementById("game-board");
const timerElement = document.getElementById("timer");
const modalAnswer = document.getElementById("modal-answer");
const correctButton = document.getElementById("correct-button");
const wrongButton = document.getElementById("wrong-button");
const winnerPanel = document.getElementById("winner-panel");
const winnerTitle = document.getElementById("winner-title");
const winnerScore = document.getElementById("winner-score");

let teams = [];
let activeTeamIndex = 0;
let selectedTile = null;
let timerId = null;
let secondsLeft = 30;
let currentBoard = [];

function showScreen(screenId) {
  document.querySelectorAll(".jeopardy-screen").forEach(screen => {
    screen.style.display = screen.id === screenId ? "block" : "none";
  });
  if (screenId === "setup-screen") {
    renderTeamFields();
    renderSetSelect();
    const requestedScreen = new URLSearchParams(window.location.search).get("screen");
    showScreen(requestedScreen === "editor-screen" ? "editor-screen" : "main-menu");
  }
  if (screenId === "editor-screen") {
    renderEditorSets();
  }
}

function renderSetSelect() {
  setSelect.replaceChildren();
  Object.keys(getJeopardySets()).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    setSelect.append(option);
  });
}

function renderTeamFields() {
  const count = Number(teamCount.value);
  teamFields.replaceChildren();

  for (let index = 0; index < count; index += 1) {
    const label = document.createElement("label");
    label.setAttribute("for", `team-${index}`);
    label.textContent = `Team ${index + 1}`;
    const input = document.createElement("input");
    input.id = `team-${index}`;
    input.type = "text";
    input.value = `Team ${index + 1}`;
    input.maxLength = 30;
    input.required = true;
    teamFields.append(label, input);
  }
}

function startGame() {
  const selectedSet = getJeopardySets()[setSelect.value] || [];
  const usableCategories = selectedSet.filter(category => category.questions.length > 0);
  if (usableCategories.length === 0) {
    alert("Dieses Set enthält noch keine Fragen.");
    return;
  }

  teams = Array.from(teamFields.querySelectorAll("input")).map((input, index) => ({
    name: input.value.trim() || `Team ${index + 1}`,
    score: 0
  }));
  activeTeamIndex = 0;
  selectedTile = null;
  currentBoard = usableCategories;
  winnerPanel.hidden = true;
  showScreen("game-screen");
  renderScoreboard();
  renderBoard();
}

function renderScoreboard() {
  scoreboard.replaceChildren();
  teams.forEach((team, index) => {
    const teamCard = document.createElement("button");
    teamCard.type = "button";
    teamCard.className = `team-score${index === activeTeamIndex ? " active-team" : ""}`;
    teamCard.innerHTML = `<strong>${escapeHtml(team.name)}</strong><span>${team.score} Punkte</span>`;
    teamCard.addEventListener("click", () => {
      activeTeamIndex = index;
      renderScoreboard();
      updateTurnLabel();
    });
    scoreboard.append(teamCard);
  });
  updateTurnLabel();
}

function renderBoard() {
  gameBoard.replaceChildren();
  const board = currentBoard;
  board.forEach((column, categoryIndex) => {
    const boardColumn = document.createElement("div");
    boardColumn.className = "board-column";
    const categoryHeader = document.createElement("div");
    categoryHeader.className = "category-header";
    categoryHeader.textContent = column.category;
    boardColumn.append(categoryHeader);

    column.questions.forEach(questionData => {
      const value = questionData.value;
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "board-tile";
      tile.textContent = `$${value}`;
      tile.dataset.category = categoryIndex;
      tile.dataset.value = value;
      tile.addEventListener("click", () => openQuestion(tile, column, questionData));
      boardColumn.append(tile);
    });
    gameBoard.append(boardColumn);
  });
}

function openQuestion(tile, column, questionData) {
  const { question, answer, value } = questionData;
  selectedTile = { tile, value };
  document.getElementById("modal-category").textContent = column.category;
  document.getElementById("modal-value").textContent = `$${value}`;
  document.getElementById("modal-question").textContent = question;
  modalAnswer.textContent = answer;
  modalAnswer.hidden = true;
  document.getElementById("show-answer-button").disabled = false;
  correctButton.disabled = true;
  wrongButton.disabled = true;
  secondsLeft = 30;
  timerElement.textContent = secondsLeft;
  modal.hidden = false;
  timerId = window.setInterval(() => {
    secondsLeft -= 1;
    timerElement.textContent = secondsLeft;
    if (secondsLeft <= 0) {
      clearTimer();
      timerElement.textContent = "Zeit abgelaufen";
      enableScoring();
    }
  }, 1000);
}

function enableScoring() {
  correctButton.disabled = false;
  wrongButton.disabled = false;
}

function finishQuestion(isCorrect) {
  if (!selectedTile) return;
  teams[activeTeamIndex].score += isCorrect ? selectedTile.value : -selectedTile.value;
  selectedTile.tile.disabled = true;
  selectedTile.tile.classList.add("used-tile");
  closeQuestion();
  renderScoreboard();
  activeTeamIndex = (activeTeamIndex + 1) % teams.length;
  renderScoreboard();
  if (gameBoard.querySelectorAll(".board-tile:not(:disabled)").length === 0) {
    showWinner();
  }
}

function showWinner() {
  const highestScore = Math.max(...teams.map(team => team.score));
  const winners = teams.filter(team => team.score === highestScore);
  winnerTitle.textContent = winners.length === 1
    ? `${winners[0].name} gewinnt!`
    : "Unentschieden!";
  winnerScore.textContent = winners.length === 1
    ? `${highestScore} Punkte`
    : `${winners.map(team => team.name).join(" und ")} mit jeweils ${highestScore} Punkten`;
  winnerPanel.hidden = false;
}

function closeQuestion() {
  clearTimer();
  modal.hidden = true;
  selectedTile = null;
}

function clearTimer() {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function updateTurnLabel() {
  const label = document.getElementById("turn-label");
  label.textContent = teams.length ? `Am Zug: ${teams[activeTeamIndex].name}` : "";
}

function renderEditorSets() {
  activeSetSelect.replaceChildren();
  Object.keys(getJeopardySets()).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    activeSetSelect.append(option);
  });
  categoryEditor.hidden = !activeSetSelect.value;
  renderCategories();
}

function createSet() {
  const input = document.getElementById("new-set-name");
  const name = input.value.trim().replace(/\s+/g, "_");
  const sets = getJeopardySets();

  if (!name) {
    alert("Bitte einen Namen eingeben.");
    return;
  }
  if (sets[name]) {
    alert("Dieses Set existiert bereits.");
    return;
  }

  sets[name] = [];
  saveJeopardySets(sets);
  input.value = "";
  renderEditorSets();
  activeSetSelect.value = name;
  renderCategories();
}

function addCategory(event) {
  event.preventDefault();
  const input = document.getElementById("category-name");
  const name = input.value.trim();
  const sets = getJeopardySets();
  if (!name || !activeSetSelect.value) return;

  sets[activeSetSelect.value].push({ category: name, questions: [] });
  saveJeopardySets(sets);
  input.value = "";
  renderCategories();
}

function addQuestion(categoryIndex, event) {
  event.preventDefault();
  const form = event.currentTarget;
  const question = form.elements.question.value.trim();
  const answer = form.elements.answer.value.trim();
  const value = Number(form.elements.value.value);
  const sets = getJeopardySets();
  const category = sets[activeSetSelect.value][categoryIndex];

  if (!question || !answer || !values.includes(value)) return;
  if (category.questions.length >= values.length) {
    alert("Eine Kategorie kann maximal fünf Fragen enthalten.");
    return;
  }

  if (category.questions.some(item => item.value === value)) {
    alert("Dieser Punktewert ist in der Kategorie bereits vergeben.");
    return;
  }

  category.questions.push({ question, answer, value });
  category.questions.sort((first, second) => first.value - second.value);
  saveJeopardySets(sets);
  renderCategories();
}

function deleteCategory(categoryIndex) {
  const sets = getJeopardySets();
  sets[activeSetSelect.value].splice(categoryIndex, 1);
  saveJeopardySets(sets);
  renderCategories();
}

function renderCategories() {
  categoriesList.replaceChildren();
  const categories = getJeopardySets()[activeSetSelect.value] || [];

  categories.forEach((category, categoryIndex) => {
    const card = document.createElement("div");
    card.className = "category-editor";
    const heading = document.createElement("h3");
    heading.textContent = category.category;
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-secondary delete-category";
    deleteButton.textContent = "Kategorie löschen";
    deleteButton.addEventListener("click", () => deleteCategory(categoryIndex));
    card.append(heading, deleteButton);

    const questionList = document.createElement("ol");
    category.questions.forEach(({ question, answer, value }) => {
      const item = document.createElement("li");
      item.textContent = `${value} Punkte: ${question} – ${answer}`;
      questionList.append(item);
    });
    card.append(questionList);

    if (category.questions.length < values.length) {
      const form = document.createElement("form");
      form.className = "question-editor-form";
      form.innerHTML = `
        <input name="question" required placeholder="Frage">
        <input name="answer" required placeholder="Antwort">
        <select name="value" required aria-label="Punktewert">
          ${values.map(value => `<option value="${value}">${value} Punkte</option>`).join("")}
        </select>
        <button class="btn" type="submit">Frage hinzufügen</button>
      `;
      form.addEventListener("submit", event => addQuestion(categoryIndex, event));
      card.append(form);
    }
    categoriesList.append(card);
  });
}

function escapeHtml(text) {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
}

teamCount.addEventListener("change", renderTeamFields);
activeSetSelect.addEventListener("change", renderCategories);
document.getElementById("category-form").addEventListener("submit", addCategory);
document.getElementById("show-answer-button").addEventListener("click", () => {
  modalAnswer.hidden = false;
  document.getElementById("show-answer-button").disabled = true;
  enableScoring();
});
correctButton.addEventListener("click", () => finishQuestion(true));
wrongButton.addEventListener("click", () => finishQuestion(false));
document.getElementById("close-modal-button").addEventListener("click", closeQuestion);

renderTeamFields();
renderSetSelect();
