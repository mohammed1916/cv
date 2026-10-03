const chapters = ['Resolve an operand', 'Build an alternative', 'Collect the answers'];
const words = (values = []) => `{${values.slice(0, 8).map(value => value === '' ? 'ε' : value).join(', ')}${values.length > 8 ? ', …' : ''}}`;

export function braceNarrative({ step, input: expression }) {
  const base = {
    goal: 'Turn the expression into every distinct word it represents, then return those words in sorted order.',
    chapters,
    edgeCases: [
      'Repeated alternatives collapse to one word because results are sets.',
      'Adjacent groups form all prefix-choice combinations, not pairwise matches.',
      'Nested groups finish before their choices can extend the outer prefixes.',
      'Use a valid brace expression; the trace assumes balanced braces and nonempty alternatives.',
    ],
    strategyLabel: 'Strategy (repeated for each nested group)',
    chapter: 0,
    scope: step ? `Current scope: ${step.depth === 0 ? 'whole expression' : `nested group at depth ${step.depth}`} (these chapters repeat inside braces)` : 'Ready to explore',
    activeLine: step?.activeLine,
    why: 'Braces give us choices, adjacency joins choices, and commas separate alternatives. We solve nested groups before using their choices outside.',
    achieved: 'Nothing has been expanded yet. Each recursive call will keep its own unfinished prefixes and completed alternatives.',
    next: expression ? `Start parsing “${expression}”. Watch one operand become choices, then prefixes, then completed words.` : 'Enter an expression to begin.',
  };
  if (!step) return base;
  const phase = step.phase;
  const state = {
    chapter: 0,
    why: 'Resolve the next operand into a set of choices so the same concatenation rule works for both letters and nested braces.',
    achieved: `In this call, product holds ${words(step.product)} and union holds ${words(step.union)}. These are local results, not necessarily the final answer.`,
    next: 'Use the next operand to extend every prefix in the current alternative.',
  };
  if (['enter', 'initialize', 'reset-product'].includes(phase)) {
    state.why = 'The empty word ε is a starting prefix: ε + a = a. An empty set would produce no combinations. Each alternative needs a fresh start.';
    state.achieved = `We have a starting prefix ${words(step.product)}; completed alternatives remain safe in union ${words(step.union)}.`;
    state.next = 'Read an operand and turn it into choices to append.';
  } else if (phase === 'open-brace') {
    state.why = 'The outer alternative cannot continue until we know every word this brace group can produce. Recursion solves that smaller problem with separate state.';
    state.achieved = `The outer prefixes ${words(step.product)} are preserved while we resolve the nested group.`;
    state.next = 'Enter the nested call; repeat the same three chapters inside its braces.';
  } else if (['literal', 'group-return'].includes(phase)) {
    state.achieved = `One operand is now resolved to ${words(step.group)}. We can use these choices without inspecting its internal structure again.`;
    state.next = `Append each choice to every prefix in ${words(step.product)}.`;
  } else if (phase === 'concatenate') {
    state.chapter = 1;
    state.why = 'Adjacent operands must appear together. Taking every prefix–choice pair preserves every possible word for this alternative.';
    state.achieved = `${words(step.leftSet)} combined with ${words(step.rightSet)} gives ${words(step.resultSet)}: ${step.resultSet.length} distinct prefixes. They are complete only when this alternative ends.`;
    state.next = 'Read the next symbol: extend again for another operand, or collect these words at a comma or the end of this scope.';
  } else if (['comma', 'union', 'final-union'].includes(phase)) {
    state.chapter = 2;
    state.why = 'A completed alternative contributes valid words independently of the other alternatives. Set union keeps them all while removing duplicates.';
    state.achieved = phase === 'comma'
      ? `The current alternative is complete: ${words(step.product)}. It is ready to be collected.`
      : `This scope has collected ${words(step.resultSet)}. This merge added ${step.resultSet.length - step.leftSet.length} new distinct words.`;
    state.next = phase === 'final-union' ? 'Return this scope’s choices and the cursor position to its caller.' : 'Start the next alternative from ε so it does not inherit the previous prefixes.';
  } else if (['close-brace', 'leave-brace', 'return'].includes(phase)) {
    state.chapter = 2;
    state.why = 'Returning both the choices and cursor lets the caller use this entire group as one operand and resume after its closing brace.';
    state.achieved = `This scope is fully expanded to ${words(step.union)}.`;
    state.next = step.depth > 0 ? 'The parent will append these choices to its saved prefixes.' : 'The outer call has all distinct words; sort them for the final answer.';
  } else if (['parsed', 'done'].includes(phase)) {
    state.chapter = 2;
    state.why = 'Sets enforce uniqueness throughout the expansion; the final sort supplies the required output order.';
    state.achieved = `The whole expression yields ${step.result.length} distinct words: ${words(step.result)}.${phase === 'done' ? ' The sorted answer is ready.' : ''}`;
    state.next = phase === 'done' ? 'Trace backward to see which concatenations and alternatives contributed these words, or try another expression.' : 'Return the words in sorted order.';
  } else if (phase === 'advance') {
    state.why = 'Advance past the symbol already handled so it is not processed twice. Moving the cursor itself creates no new words.';
    state.next = step.activeLine === 18 ? `Append the resolved choice ${words(step.group)} to the current prefixes.` : 'Inspect the first operand of the next alternative.';
  }
  return { ...base, ...state };
}
