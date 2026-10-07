const DEFAULT_JEOPARDY_SETS = {
  "Deutsch-Beispiele": [
    {
      category: "Grammatik",
      questions: [
        ["Bestimme die Wortart: „schnell“.", "Adjektiv"],
        ["Wie lautet der Plural von „Museum“?", "Museen"],
        ["Nenne die vier Fälle der deutschen Sprache.", "Nominativ, Genitiv, Dativ und Akkusativ"],
        ["Was ist ein Prädikat?", "Der Satzteil, der meist die Handlung oder das Geschehen ausdrückt"],
        ["Bestimme den Nebensatz: „Ich bleibe zu Hause, weil es regnet.“", "Kausalsatz"]
      ]
    },
    {
      category: "Stilmittel",
      questions: [
        ["„Der Wind flüstert.“ Welches Stilmittel ist das?", "Personifikation"],
        ["Was ist eine Übertreibung?", "Hyperbel"],
        ["„Stark wie ein Löwe“ ist ein Beispiel für …", "einen Vergleich"],
        ["Wie heißt die Wiederholung eines Wortes am Satzanfang?", "Anapher"],
        ["Was bewirkt eine rhetorische Frage?", "Sie erwartet keine echte Antwort und regt zum Nachdenken an"]
      ]
    },
    {
      category: "Gedichte",
      questions: [
        ["Wie nennt man eine Zeile im Gedicht?", "Vers"],
        ["Was ist ein Paarreim?", "Zwei aufeinanderfolgende Verse reimen sich (aabb)"],
        ["Wie heißt das lyrische Ich?", "Die sprechende Stimme im Gedicht"],
        ["Was ist ein Kreuzreim?", "Das Reimschema abab"],
        ["Was untersucht das Versmaß?", "Den Rhythmus eines Verses"]
      ]
    },
    {
      category: "Rechtschreibung",
      questions: [
        ["Schreibe richtig: „Rad fahren“ oder „radfahren“?", "Rad fahren"],
        ["Wann schreibt man ein Nomen groß?", "Wenn es als Substantiv gebraucht wird"],
        ["Ergänze: „Sie ___ heute früh auf.“", "steht"],
        ["Schreibe richtig: „dass“ oder „das“ in „Ich weiß, ___ du kommst.“", "dass"],
        ["Wie trennt man „Schokolade“ am Zeilenende?", "Scho-ko-la-de"]
      ]
    },
    {
      category: "Literatur",
      questions: [
        ["Wer schrieb „Die Verwandlung“?", "Franz Kafka"],
        ["Was ist eine Fabel?", "Eine kurze lehrhafte Erzählung, oft mit Tieren als Figuren"],
        ["Wie nennt man die Hauptfigur einer Geschichte?", "Protagonist oder Protagonistin"],
        ["Was ist eine Ballade?", "Ein Gedicht, das Elemente aus Lyrik, Epik und Dramatik verbindet"],
        ["Was bedeutet „Erzählperspektive“?", "Der Blickwinkel, aus dem eine Geschichte erzählt wird"]
      ]
    }
  ]
};

function getJeopardySets() {
  const data = localStorage.getItem("jeopardy_sets");
  if (!data) {
    saveJeopardySets(DEFAULT_JEOPARDY_SETS);
    return getJeopardySets();
  }
  const sets = JSON.parse(data);
  let changed = false;

  Object.values(sets).forEach(categories => {
    categories.forEach(category => {
      category.questions = category.questions.map((question, index) => {
        if (Array.isArray(question)) {
          changed = true;
          return { question: question[0], answer: question[1], value: (index + 1) * 100 };
        }

        const value = [100, 200, 300, 400, 500].includes(Number(question.value))
          ? Number(question.value)
          : (index + 1) * 100;
        if (question.value !== value) changed = true;
        return { question: question.question, answer: question.answer, value };
      });
    });
  });

  if (changed) saveJeopardySets(sets);
  return sets;
}

function saveJeopardySets(sets) {
  localStorage.setItem("jeopardy_sets", JSON.stringify(sets));
}
