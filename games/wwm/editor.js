let currentSetKey = "";
let editingQuestionIndex = null;

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
  const selectedSetKey = document.getElementById('select-active-set').value;
  if (selectedSetKey !== currentSetKey && editingQuestionIndex !== null) {
    resetQuestionForm();
  }
  currentSetKey = selectedSetKey;
  const formCard = document.getElementById('question-form-card');
  formCard.style.display = currentSetKey ? 'block' : 'none';
  if (currentSetKey) renderQuestionsList();
}

function addQuestion(event) {
  event.preventDefault();
  const sets = getQuizSets();
  const question = {
    difficulty: parseInt(document.getElementById('q-difficulty').value, 10),
    question: document.getElementById('q-text').value.trim(),
    answers: {
      A: document.getElementById('q-a').value.trim(),
      B: document.getElementById('q-b').value.trim(),
      C: document.getElementById('q-c').value.trim(),
      D: document.getElementById('q-d').value.trim()
    },
    correct: document.getElementById('q-correct').value
  };

  if (editingQuestionIndex === null) {
    sets[currentSetKey].push(question);
  } else {
    sets[currentSetKey][editingQuestionIndex] = question;
  }

  saveQuizSets(sets);
  resetQuestionForm();
  renderQuestionsList();
}

function editQuestion(index) {
  const question = getQuizSets()[currentSetKey][index];
  if (!question) return;

  editingQuestionIndex = index;
  document.getElementById('q-difficulty').value = question.difficulty;
  document.getElementById('q-text').value = question.question;
  document.getElementById('q-a').value = question.answers.A;
  document.getElementById('q-b').value = question.answers.B;
  document.getElementById('q-c').value = question.answers.C;
  document.getElementById('q-d').value = question.answers.D;
  document.getElementById('q-correct').value = question.correct;
  document.getElementById('question-submit-button').textContent = 'Änderungen speichern';
  document.getElementById('cancel-edit-button').hidden = false;
  document.getElementById('q-text').focus();
}

function cancelEdit() {
  resetQuestionForm();
}

function resetQuestionForm() {
  editingQuestionIndex = null;
  document.getElementById('question-form').reset();
  document.getElementById('question-submit-button').textContent = 'Frage speichern';
  document.getElementById('cancel-edit-button').hidden = true;
}

function deleteQuestion(index) {
  const sets = getQuizSets();
  sets[currentSetKey].splice(index, 1);
  saveQuizSets(sets);
  if (editingQuestionIndex === index) {
    resetQuestionForm();
  } else if (editingQuestionIndex !== null && editingQuestionIndex > index) {
    editingQuestionIndex -= 1;
  }
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
      <button class="question-summary" type="button" onclick="editQuestion(${index})">
        <strong>[Stufe ${question.difficulty}]</strong> ${question.question}
        <span class="question-answer-hint">Antworten anzeigen und bearbeiten</span>
      </button>
      <button class="btn btn-secondary delete-question-btn" onclick="deleteQuestion(${index})">Löschen</button>
    `;
    listContainer.appendChild(item);
  });
}
