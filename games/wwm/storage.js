const DEFAULT_SETS = {
  "Set_Klasse_8": [
    {
      difficulty: 1,
      question: "Haben, sein und werden sind die drei...",
      answers: { A: "Verderben", B: "Alleinerben", C: "Hilfsverben", D: "Baumsterben" },
      correct: "C"
    },
    {
      difficulty: 2,
      question: "Welche Wortart beschreibt ein Nomen näher?",
      answers: { A: "Adjektiv", B: "Verb", C: "Pronomen", D: "Adverb" },
      correct: "A"
    },
    {
      difficulty: 3,
      question: "Welche Stilfigur ist: 'Der Verstand ist ein Messer'?",
      answers: { A: "Anapher", B: "Metapher", C: "Alliteration", D: "Ellipse" },
      correct: "B"
    }
  ]
};

function getQuizSets() {
  const data = localStorage.getItem('quiz_sets');
  if (!data) {
    saveQuizSets(DEFAULT_SETS);
    return DEFAULT_SETS;
  }
  return JSON.parse(data);
}

function saveQuizSets(sets) {
  localStorage.setItem('quiz_sets', JSON.stringify(sets));
}

function exportSets() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getQuizSets(), null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = dataStr;
  downloadAnchor.download = "deutsch_spiele_fragen.json";
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importSets(event, callback) {
  const file = event.target.files[0];
  if (!file) return;
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      saveQuizSets({ ...getQuizSets(), ...importedData });
      alert("Fragensets erfolgreich importiert!");
      if (callback) callback();
    } catch (err) {
      alert("Fehler beim Lesen der JSON-Datei!");
    }
    event.target.value = '';
  };
  fileReader.readAsText(file);
}
