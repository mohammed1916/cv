// Reasons are keyed by the recursive event kind as well as the displayed line, because line 5 and
// line 6 both perform a call (entering a child pair) and a receipt (storing the child's boolean).
const checkLessons = {
  2: ['Check the empty pair', 'Two absent children describe the same structure. Settle that base case before reading either value.'],
  3: ['Check structural agreement', 'Equal values elsewhere cannot repair a missing child. If only one node exists here, this pair fails.'],
  4: ['Compare this pair of values', 'Matching structure is not enough: the values at corresponding positions must also agree.'],
};
const eventLessons = {
  'return:2': ['Base case returns true', 'Two absent children match. This call returns true to its parent without reading any values.'],
  'return:3': ['Structure differs: return false', 'Exactly one child exists at this position. The pair cannot match, so this call returns false.'],
  'return:4': ['Values differ: return false', 'The values at this position disagree, so this pair fails and the call returns false.'],
  'call:5': ['Call the left children', 'Matching values establish only a local match. The left children become the next pair, and this call waits for its boolean.'],
  'receive:5': ['Store the left result', 'The left call has returned a boolean. This pair keeps it as left_ok before moving on.'],
  'call:6': ['Call the right children', 'The left result covers only half of this pair. The right children become the next pair before both results are combined.'],
  'receive:6': ['Store the right result', 'The right call has returned a boolean. This pair keeps it as right_ok before combining both results.'],
  'return:7': ['Return both results combined', 'A pair matches only when both child results are true. This boolean returns to the caller, which receives it as its left_ok or right_ok.'],
};
function lessonFor(step) {
  if (step.kind === 'check') return checkLessons[step.activeLine];
  return eventLessons[`${step.kind}:${step.activeLine}`] ?? checkLessons[step.activeLine];
}
export function sameTreeTutorial({step}) {
  const lesson = step.phase === 'start' ? ['Start with the roots', 'Compare corresponding positions together. Each recursive call decides whether one pair of subtrees matches.'] : lessonFor(step);
  const [title, reason] = lesson ?? ['Compare this pair', step.message];
  const valueOf = (nodes, id) => nodes.find(node => node.id === id)?.val ?? 'null';
  const rootOf = (nodes, edges) => nodes.find(node => !edges.some(edge => edge.toId === node.id))?.id ?? null;
  const pId = step.phase === 'start' ? rootOf(step.pNodes, step.pEdges) : step.activePId;
  const qId = step.phase === 'start' ? rootOf(step.qNodes, step.qEdges) : step.activeQId;
  const focus = step.phase === 'done' ? ['result'] : step.kind === 'call' ? ['call'] : step.kind === 'receive' ? ['receive'] : step.kind === 'return' ? ['return'] : ['pair'];
  const variables = step.phase === 'done' ? { result: step.finalResult } : { p: valueOf(step.pNodes, pId), q: valueOf(step.qNodes, qId) };
  if (step.kind === 'call') {
    variables[`${step.side} child p`] = valueOf(step.pNodes, step.childP);
    variables[`${step.side} child q`] = valueOf(step.qNodes, step.childQ);
  }
  if (step.returned !== null && step.returned !== undefined) variables.returned = String(step.returned);
  return {
    title: step.phase === 'done' ? 'Report the tree comparison' : title,
    reason, action: step.message, focus,
    variables,
  };
}
