let editorSetKey = '';
let editingQuestionIndex = null;

function updateEditorSetsDropdown() {
  const sets = getQuizDuelSets();
  const select = document.getElementById('select-active-set');
  select.innerHTML = '<option value="">-- Bitte wählen --</option>';
  Object.keys(sets).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.innerText = key;
    select.appendChild(option);
  });
  if (editorSetKey) select.value = editorSetKey;
  loadActiveSet();
}

function createNewSet() {
  const input = document.getElementById('new-set-name');
  const name = input.value.trim().replace(/\s+/g, '_');
  if (!name) return alert('Bitte einen Namen eingeben!');

  const sets = getQuizDuelSets();
  if (sets[name]) return alert('Dieses Set existiert bereits!');

  sets[name] = [];
  saveQuizDuelSets(sets);
  editorSetKey = name;
  input.value = '';
  updateEditorSetsDropdown();
}

function loadActiveSet() {
  const selectedSetKey = document.getElementById('select-active-set').value;
  if (selectedSetKey !== editorSetKey && editingQuestionIndex !== null) {
    resetQuestionForm();
  }
  editorSetKey = selectedSetKey;
  document.getElementById('question-form-card').style.display = editorSetKey ? 'block' : 'none';
  if (editorSetKey) renderQuestionsList();
}

function addQuestion(event) {
  event.preventDefault();
  const sets = getQuizDuelSets();
  const question = {
    question: document.getElementById('q-text').value.trim(),
    solution: document.getElementById('q-solution').value.trim()
  };

  if (editingQuestionIndex === null) {
    sets[editorSetKey].push(question);
  } else {
    sets[editorSetKey][editingQuestionIndex] = question;
  }
  saveQuizDuelSets(sets);
  resetQuestionForm();
  renderQuestionsList();
}

function editQuestion(index) {
  const question = getQuizDuelSets()[editorSetKey][index];
  if (!question) return;

  editingQuestionIndex = index;
  document.getElementById('q-text').value = question.question;
  document.getElementById('q-solution').value = question.solution;
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
  const sets = getQuizDuelSets();
  sets[editorSetKey].splice(index, 1);
  saveQuizDuelSets(sets);
  if (editingQuestionIndex === index) resetQuestionForm();
  renderQuestionsList();
}

function renderQuestionsList() {
  const list = document.getElementById('questions-list');
  list.innerHTML = '';
  (getQuizDuelSets()[editorSetKey] || []).forEach((question, index) => {
    const item = document.createElement('div');
    item.className = 'question-list-item';
    item.innerHTML = `<button class="question-summary" type="button" onclick="editQuestion(${index})">
        <strong>${question.question}</strong>
        <span class="question-answer-hint">Antworten anzeigen und bearbeiten</span>
      </button>
      <button class="btn btn-secondary delete-question-btn" type="button" onclick="deleteQuestion(${index})">Löschen</button>`;
    list.appendChild(item);
  });
}
