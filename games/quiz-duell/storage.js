const DEFAULT_QUIZ_DUEL_SETS = {
  "Beispielset": [
    {
      question: "Haben, sein und werden sind die drei...",
      solution: "Hilfsverben"
    },
    {
      question: "Welche Wortart beschreibt ein Nomen näher?",
      solution: "Adjektiv"
    }
  ]
};

function getQuizDuelSets() {
  const data = localStorage.getItem('quiz_duel_sets');
  if (!data) {
    saveQuizDuelSets(DEFAULT_QUIZ_DUEL_SETS);
    return DEFAULT_QUIZ_DUEL_SETS;
  }
  return JSON.parse(data);
}

function saveQuizDuelSets(sets) {
  localStorage.setItem('quiz_duel_sets', JSON.stringify(sets));
}

function exportQuizDuelSets() {
  const data = JSON.stringify(getQuizDuelSets(), null, 2);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`;
  downloadAnchor.download = 'quiz_duell_fragensets.json';
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importQuizDuelSets(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function (loadEvent) {
    try {
      const importedData = JSON.parse(loadEvent.target.result);
      validateQuizDuelSets(importedData);
      saveQuizDuelSets({ ...getQuizDuelSets(), ...importedData });
      alert('Quiz-Duell-Fragensets erfolgreich importiert!');
      updateEditorSetsDropdown();
    } catch (error) {
      alert(`Fehler beim Importieren: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  };
  fileReader.readAsText(file);
}

function validateQuizDuelSets(sets) {
  if (!sets || typeof sets !== 'object' || Array.isArray(sets)) {
    throw new Error('Die JSON-Datei muss ein Objekt mit Fragensets enthalten.');
  }

  Object.entries(sets).forEach(([setName, questions]) => {
    if (!setName || !Array.isArray(questions)) {
      throw new Error(`Das Set "${setName}" enthält keine gültige Fragenliste.`);
    }
    questions.forEach((question, index) => {
      if (
        !question ||
        typeof question.question !== 'string' ||
        typeof question.solution !== 'string'
      ) {
        throw new Error(`Frage ${index + 1} im Set "${setName}" ist ungültig.`);
      }
    });
  });
}
