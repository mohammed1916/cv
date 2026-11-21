// Narration clips are keyed by the solver frame and beat kind, so a fixed preset always
// maps to the same clip. Keys never depend on playback mode: `why` contains every beat kind.
import { buildTutorialSequence } from './tutorialSequence.js';

export const narrationKey = beat => `${beat.frameIndex}-${beat.kind}`;

export const narrationUrl = (routeId, presetIndex, beat) =>
  `/tutorial-audio/${routeId}/${presetIndex}/${narrationKey(beat)}.mp3`;

// Spoken text is written from the scene's own authored fields (original wording, no statement text).
export function narrationLine(beat) {
  if (beat.kind === 'reason') return beat.scene.reason;
  if (beat.kind === 'code') return `Next, this line runs: ${beat.scene.title}.`;
  return beat.scene.action;
}

export function buildNarrationScript(run, tutorial) {
  return buildTutorialSequence(run, tutorial, 'why').map(beat => ({
    key: narrationKey(beat),
    kind: beat.kind,
    text: narrationLine(beat),
  }));
}
