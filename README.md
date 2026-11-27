# Gesture Synth

A camera-based musical instrument that lets you control chords, tone, and expression using hand gestures.

## Demo

🎥 Watch the Gesture Synth tutorial on Instagram:
https://www.instagram.com/p/DbH1BACxNCG/

## Features
- Left hand controls chord selection
- Right hand controls voicing and expression
- Real-time hand tracking with MediaPipe
- Web Audio API synthesis

## Functional Mode

Pick **Functional Mode** from the mode menu and the chord quality follows the
key, so the left hand no longer tilts for major or minor.
The left hand picks a scale degree, the right hand picks a harmonic function,
and the two together select one cell of this table (shown here in C):

| Left \ Right | Closed hand | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- | --- |
| | Diatonic triad | Diatonic 7th | Secondary dominant | Minor borrowed | Minor borrowed 7th |
| 1 | C (I) | Cmaj7 (Imaj7) | G7 (V7) | Cm (i) | Cm7 (i7) |
| 2 | Dm (ii) | Dm7 (ii7) | A7 (V7/ii) | Ddim (ii°) | Dm7b5 (iiø7) |
| 3 | Em (iii) | Em7 (iii7) | B7 (V7/iii) | Eb (bIII) | Ebmaj7 (bIIImaj7) |
| 4 | F (IV) | Fmaj7 (IVmaj7) | C7 (V7/IV) | Fm (iv) | Fm7 (iv7) |
| 5 | G (V) | G7 (V7) | D7 (V7/V) | Gm (v) | Gm7 (v7) |
| 6 (1 finger, hand tilted) | Am (vi) | Am7 (vi7) | E7 (V7/vi) | Ab (bVI) | Abmaj7 (bVImaj7) |

- A closed left hand is silence.
- Right-hand thumb (octave), tilt (filter) and height (volume) work as in classic mode.
- The in-app guide shows the same table in the selected key and highlights the chord being played.
- The table lives in `functional.js` as `FUNCTIONAL_TABLE`; edit a cell there to change what a hand combination plays.

## Built With
- JavaScript
- MediaPipe Hand Landmarker
- Web Audio API
- Vite

## License
Gesture Synth is free to use, modify, and share for educational and non-commercial purposes.
If you build upon this project, please credit the original creator.
