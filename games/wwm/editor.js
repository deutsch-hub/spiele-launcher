let currentSetKey = "";

function updateEditorSetsDropdown() {
  const sets = getQuizSets();
  const select = document.getElementById('select-active-set');
  select.innerHTML = '<option value="">-- Bitte wählen --</option>';
  Object.keys(sets).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.innerText = key;
    select.appendChild(option);
  });
  if (currentSetKey) select.value = currentSetKey;
  loadActiveSet();
}

function createNewSet() {
  const nameInput = document.getElementById('new-set-name');
  const name = nameInput.value.trim().replace(/\s+/g, '_');
  if (!name) return alert("Bitte Name eingeben!");

  const sets = getQuizSets();
  if (sets[name]) return alert("Set existiert bereits!");

  sets[name] = [];
  saveQuizSets(sets);
  currentSetKey = name;
  nameInput.value = '';
  updateEditorSetsDropdown();
}

function loadActiveSet() {
  currentSetKey = document.getElementById('select-active-set').value;
  const formCard = document.getElementById('question-form-card');
  formCard.style.display = currentSetKey ? 'block' : 'none';
  if (currentSetKey) renderQuestionsList();
}

function addQuestion(event) {
  event.preventDefault();
  const sets = getQuizSets();
  sets[currentSetKey].push({
    difficulty: parseInt(document.getElementById('q-difficulty').value, 10),
    question: document.getElementById('q-text').value,
    answers: {
      A: document.getElementById('q-a').value,
      B: document.getElementById('q-b').value,
      C: document.getElementById('q-c').value,
      D: document.getElementById('q-d').value
    },
    correct: document.getElementById('q-correct').value
  });
  saveQuizSets(sets);
  document.getElementById('question-form').reset();
  renderQuestionsList();
}

function deleteQuestion(index) {
  const sets = getQuizSets();
  sets[currentSetKey].splice(index, 1);
  saveQuizSets(sets);
  renderQuestionsList();
}

function renderQuestionsList() {
  const listContainer = document.getElementById('questions-list');
  listContainer.innerHTML = '';
  const list = getQuizSets()[currentSetKey] || [];
  list.forEach((question, index) => {
    const item = document.createElement('div');
    item.className = 'question-list-item';
    item.innerHTML = `
      <div><strong>[Stufe ${question.difficulty}]</strong> ${question.question} (Richtig: ${question.correct})</div>
      <button class="btn btn-secondary delete-question-btn" onclick="deleteQuestion(${index})">Löschen</button>
    `;
    listContainer.appendChild(item);
  });
}
