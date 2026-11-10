// A tutorial beat is a presentation of an immutable solver frame, never a solver step.
export function buildTutorialSequence(run, tutorial, mode) {
  if (!run || !tutorial || mode === 'off') return [];
  return run.frames.flatMap((step, frameIndex) => {
    const scene = tutorial({ run, step, previousStep: run.frames[frameIndex - 1] });
    const kinds = mode === 'why' ? ['reason', 'code', 'impact'] : ['code', 'impact'];
    return kinds.map(kind => ({ key: `${frameIndex}:${kind}`, frameIndex, kind, scene }));
  });
}
export function tutorialPosition(sequence, frameIndex) {
  return Math.max(0, sequence.findIndex(beat => beat.frameIndex === frameIndex));
}
