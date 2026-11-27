// Functional-harmony mode: pure chord logic (no DOM, no audio).
//
// The left hand picks a scale degree and the right hand picks a harmonic
// function. Chord quality follows from the key instead of from hand tilt.

// Semitones above the tonic for each major-scale degree. Degree 7 sits just
// below the tonic, the same register classic mode uses for it.
const DEGREE_SEMITONES = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: -1 };

const QUALITIES = {
  maj:  { suffix: "",     intervals: [0, 4, 7],     minor: false },
  min:  { suffix: "m",    intervals: [0, 3, 7],     minor: true },
  dim:  { suffix: "dim",  intervals: [0, 3, 6],     minor: true },
  maj7: { suffix: "maj7", intervals: [0, 4, 7, 11], minor: false },
  min7: { suffix: "m7",   intervals: [0, 3, 7, 10], minor: true },
  dom7: { suffix: "7",    intervals: [0, 4, 7, 10], minor: false },
  m7b5: { suffix: "m7b5", intervals: [0, 3, 6, 10], minor: true },
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

// Names for roots outside the key (bIII, bVI). Flats keep them readable in
// every key: no Fb, Cb or double flats.
const FLAT_NOTE_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// How far past the knuckles the wrist must travel (as a fraction of full tilt)
// before one finger reads as degree 6. Roughly a 20 degree lean.
export const FUNCTIONAL_TILT_THRESHOLD = 0.25;

// Right-hand finger count (0 = closed hand) -> harmonic function.
export const FUNCTIONS = [
  { label: "Diatonic triad",     short: "Triad" },
  { label: "Diatonic 7th",       short: "7th" },
  { label: "Secondary dominant", short: "V7 of" },
  { label: "Minor borrowed",     short: "Borrow" },
  { label: "Minor borrowed 7th", short: "Borr.7" },
];

// degree: scale degree of the chord's root.
// alter:  semitones to shift that root (-1 for the flattened roots that come
//         from the parallel minor).
const chord = (degree, quality, roman, alter = 0) => ({ degree, alter, quality, roman });

// The chord table. Rows are the left-hand degree, columns are the right-hand
// finger count 0-4. Edit cells here to change what a hand combination plays;
// a null cell is silent.
export const FUNCTIONAL_TABLE = {
  //  0: triad               1: 7th                      2: V7 of the degree         3: borrowed                  4: borrowed 7th
  1: [chord(1, "maj", "I"),   chord(1, "maj7", "Imaj7"),  chord(5, "dom7", "V7"),     chord(1, "min", "i"),        chord(1, "min7", "i7")],
  2: [chord(2, "min", "ii"),  chord(2, "min7", "ii7"),    chord(6, "dom7", "V7/ii"),  chord(2, "dim", "ii°"),      chord(2, "m7b5", "iiø7")],
  3: [chord(3, "min", "iii"), chord(3, "min7", "iii7"),   chord(7, "dom7", "V7/iii"), chord(3, "maj", "bIII", -1), chord(3, "maj7", "bIIImaj7", -1)],
  4: [chord(4, "maj", "IV"),  chord(4, "maj7", "IVmaj7"), chord(1, "dom7", "V7/IV"),  chord(4, "min", "iv"),       chord(4, "min7", "iv7")],
  5: [chord(5, "maj", "V"),   chord(5, "dom7", "V7"),     chord(2, "dom7", "V7/V"),   chord(5, "min", "v"),        chord(5, "min7", "v7")],
  6: [chord(6, "min", "vi"),  chord(6, "min7", "vi7"),    chord(3, "dom7", "V7/vi"),  chord(6, "maj", "bVI", -1),  chord(6, "maj7", "bVImaj7", -1)],
};

// Left hand: 1-5 fingers are degrees 1-5, and one finger on a tilted hand is
// degree 6. Tilt is ignored for 2-5 fingers so those stay forgiving.
export function classifyFunctionalDegree(fingerCount, tilt) {
  if (fingerCount === 1 && Math.abs(tilt) >= FUNCTIONAL_TILT_THRESHOLD) return 6;
  return fingerCount >= 1 && fingerCount <= 5 ? fingerCount : null;
}

export function getFunctionalChord(degree, fingerCount) {
  const row = FUNCTIONAL_TABLE[degree];
  return (row && row[fingerCount]) || null;
}

// scale: the seven note names of the current major key, tonic first.
export function getFunctionalChordName(chord, scale) {
  let root = scale[chord.degree - 1];

  if (chord.alter !== 0) {
    const tonicPitch = FLAT_NOTE_NAMES.indexOf(scale[0]);
    const pitch = tonicPitch + DEGREE_SEMITONES[chord.degree] + chord.alter;
    root = FLAT_NOTE_NAMES[((pitch % 12) + 12) % 12];
  }

  return root + QUALITIES[chord.quality].suffix;
}

// Same voicings as classic mode: open for triads, close for sevenths.
export function getFunctionalFreqs(chord, tonicFreq) {
  const rootSemitones = DEGREE_SEMITONES[chord.degree] + chord.alter;
  const at = (semitones) => tonicFreq * Math.pow(2, (rootSemitones + semitones) / 12);
  const [, third, fifth, seventh] = QUALITIES[chord.quality].intervals;

  return seventh === undefined
    ? [at(0), at(fifth), at(12), at(third + 12)]
    : [at(0), at(third), at(fifth), at(seventh)];
}

// Plain numeral of the chord's root, lower case for minor-type chords. The
// energy ribbon reads its colour and brightness from this.
export function getFunctionalNumeral(chord) {
  const numeral = ROMAN[chord.degree - 1];
  return QUALITIES[chord.quality].minor ? numeral.toLowerCase() : numeral;
}

// Rotates a hand about its wrist until the palm points straight up. The finger
// tests compare raw x and y, which only holds for an upright hand, so counting
// on this copy gives the same count however far the hand is tilted.
// aspect: video width / height, since landmark x and y use different units.
export function toUprightLandmarks(landmarks, aspect = 4 / 3) {
  const wrist = landmarks[0];
  const middleKnuckle = landmarks[9];

  const dx = (middleKnuckle.x - wrist.x) * aspect;
  const dy = middleKnuckle.y - wrist.y;
  const length = Math.hypot(dx, dy);
  if (!length) return landmarks;

  const cos = -dy / length;
  const sin = dx / length;

  return landmarks.map((point) => {
    const px = (point.x - wrist.x) * aspect;
    const py = point.y - wrist.y;
    return { x: px * cos + py * sin, y: py * cos - px * sin };
  });
}
