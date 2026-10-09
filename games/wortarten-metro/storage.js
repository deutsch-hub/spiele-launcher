const DEFAULT_METRO_SETS = {
  "Beispielkarten": [
    {
      sentence: "Das ist ein schöner Testsatz.",
      solution: "Das = Artikel-Linie, ist = Verb-Linie, ein = Artikel-Linie, schöner = Adjektiv-Linie, Testsatz = Nomen-Linie."
    },
    {
      sentence: "Die Kinder fahren mit der Metro.",
      solution: "Die = Artikel-Linie, Kinder = Nomen-Linie, fahren = Verb-Linie, mit = Präpositions-Linie, der = Artikel-Linie, Metro = Nomen-Linie."
    }
  ]
};

function getMetroSets() {
  const data = localStorage.getItem('metro_sets');
  if (!data) {
    saveMetroSets(DEFAULT_METRO_SETS);
    return DEFAULT_METRO_SETS;
  }
  return JSON.parse(data);
}

function saveMetroSets(sets) {
  localStorage.setItem('metro_sets', JSON.stringify(sets));
}

function exportMetroSets() {
  const data = JSON.stringify(getMetroSets(), null, 2);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`;
  downloadAnchor.download = 'wortarten_metro_kartensets.json';
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importMetroSets(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function (loadEvent) {
    try {
      const importedData = JSON.parse(loadEvent.target.result);
      validateMetroSets(importedData);
      saveMetroSets({ ...getMetroSets(), ...importedData });
      alert('Kartensets erfolgreich importiert!');
      if (typeof updateSetsDropdown === 'function') {
        updateSetsDropdown();
      }
    } catch (error) {
      alert(`Fehler beim Importieren: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  };
  fileReader.readAsText(file);
}

function validateMetroSets(sets) {
  if (!sets || typeof sets !== 'object' || Array.isArray(sets)) {
    throw new Error('Die JSON-Datei muss ein Objekt mit Kartensets enthalten.');
  }

  Object.entries(sets).forEach(([setName, cards]) => {
    if (!setName || !Array.isArray(cards)) {
      throw new Error(`Das Set "${setName}" enthält keine gültige Kartenliste.`);
    }

    cards.forEach((card, index) => {
      if (
        !card ||
        typeof card !== 'object' ||
        typeof card.sentence !== 'string' ||
        typeof card.solution !== 'string'
      ) {
        throw new Error(`Karte ${index + 1} im Set "${setName}" ist ungültig.`);
      }
    });
  });
}
