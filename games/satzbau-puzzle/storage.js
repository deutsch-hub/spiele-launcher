const DEFAULT_SENTENCE_SETS = {
  "Beispielsätze": [
    "Die Schülerin liest ein spannendes Buch.",
    "Morgen besucht unsere Klasse das Museum.",
    "Der kleine Hund schläft unter dem Tisch.",
    "Im Sommer schwimmen wir im See.",
    "Lisa schreibt heute einen Brief.",
    "Auf dem Pausenhof spielen die Kinder Fußball."
  ]
};

function getSentenceSets() {
  const data = localStorage.getItem("satzbau_sets");

  if (!data) {
    saveSentenceSets(DEFAULT_SENTENCE_SETS);
    return DEFAULT_SENTENCE_SETS;
  }

  return JSON.parse(data);
}

function saveSentenceSets(sets) {
  localStorage.setItem("satzbau_sets", JSON.stringify(sets));
}
