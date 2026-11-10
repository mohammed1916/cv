// The result frame copies the last decision, so it is mapped to the displayed return line here.
export const JUMP_RETURN_LINE = 11;

export function jumpWindowDefinition(base, examples) {
  return { ...base, examples, build(input) {
    const run = base.build(input);
    return {
      ...run,
      frames: run.frames.filter(frame => frame.jumpWindow).map(frame => frame.phase === 'done' ? { ...frame, activeLine: JUMP_RETURN_LINE } : frame),
    };
  } };
}
