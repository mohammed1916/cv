// Purpose belongs to the algorithm; achievements come from the current snapshot,
// never the final story result. Blocks describe code roles, not execution order.
export function createTraceNarrative({ goal, strategy, chapters, blocks, edgeCases }) {
  return ({ step }) => {
    const block = step && blocks.find(({ phases, lines }) =>
      phases?.includes(step.phase) || lines?.includes(step.activeLine));
    return {
      goal, chapters, edgeCases,
      chapter: block?.chapter,
      why: block?.why ?? strategy,
      achieved: step?.message ?? 'Playback has not started; no result has been computed yet.',
      next: step?.phase === 'done'
        ? 'Compare the result with the goal, then try an edge case or step backward to inspect the decisions.'
        : block?.next ?? strategy,
      activeLine: step?.activeLine,
    };
  };
}
