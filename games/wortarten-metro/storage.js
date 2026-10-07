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
