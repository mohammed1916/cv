// Narration clips are keyed by the solver frame and beat kind, so a fixed preset always
// maps to the same clip. Keys never depend on playback mode: `why` contains every beat kind.
import { buildTutorialSequence } from './tutorialSequence.js';

export const narrationKey = beat => `${beat.frameIndex}-${beat.kind}`;

export const narrationUrl = (routeId, presetIndex, beat) =>
  `/tutorial-audio/${routeId}/${presetIndex}/${narrationKey(beat)}.mp3`;

// Spoken text is written from the scene's own authored fields (original wording, no statement text).
export function narrationLine(beat) {
  // A scene may carry spoken wording (natural phrasing, big picture first); the on-screen text is unchanged.
  if (beat.kind === 'reason') return beat.scene.spoken?.reason ?? beat.scene.reason;
  // Continuity: the code scene continues the story from the reason just spoken, rather than announcing a new item.
  if (beat.kind === 'code') return `So we ${beat.scene.title.charAt(0).toLowerCase()}${beat.scene.title.slice(1)}.`;
  return beat.scene.spoken?.impact ?? beat.scene.action;
}

export function buildNarrationScript(run, tutorial) {
  return buildTutorialSequence(run, tutorial, 'why').map(beat => ({
    key: narrationKey(beat),
    kind: beat.kind,
    text: narrationLine(beat),
  }));
}
