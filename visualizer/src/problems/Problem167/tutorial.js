// Authored for Two Sum II: each scene explains one pointer decision on the sorted array.
const reasons = {
  start: ['Start at both ends', 'The array is sorted, so the smallest possible pair sum uses the leftmost value and the largest uses the rightmost. Every other pair sits between those two sums, which is why the ends are the first candidates.'],
  loop: ['Only the window between the pointers is open', 'Each earlier move discarded one end that could not belong to a remaining answer. Positions outside [left, right] are therefore already excluded. When left reaches right, no pair is left to test.'],
  compare: ['Add only the two pointed values', 'The target test needs one number: the sum of the current ends. That single addition decides whether this pair is the answer or whether a pointer must move.'],
  'equal-check': ['A miss moves nothing yet', 'The pair is not the answer, so both pointers stay where they are. The next test chooses the side to move from the sum alone.'],
  'less-check-small': ['Too small: drop the left value', 'Pairing the left value with any position at or before right gives a sum no larger than this one, which is still too small. So the left value cannot start an answer, and moving left one step right is safe.'],
  'less-check-large': ['Too large: drop the right value', 'Pairing the right value with any position at or after left gives a sum no smaller than this one, which is still too large. So the right value cannot end an answer, and moving right one step left is safe.'],
  found: ['Return the matching pair', 'The sum equals the target. The two positions are reported 1-based, and left is before right because the list is sorted and left was never moved past right.'],
  done: ['No pair remains', 'Every move dropped an end that no remaining pair could use. When the pointers meet, every pair has been excluded, so the answer is null.'],
};

export function twoSumTutorial({ run, step, previousStep }) {
  const s = step.snapshot || {};
  const numbers = run.input.numbers;
  const target = run.input.target;
  const leftValue = numbers[s.left];
  const rightValue = numbers[s.right];
  let entry = reasons[step.phase] || reasons.loop;
  let focus = ['window'];
  const variables = { left: s.left + 1, right: s.right + 1, target };
  if (step.phase === 'start') variables.window = `[1..${numbers.length}]`;
  if (step.phase === 'loop') variables.window = `[${s.left + 1}..${s.right + 1}]`;
  if (step.phase === 'compare' || step.phase === 'equal-check') {
    focus = ['pair'];
    variables.sum = `${leftValue} + ${rightValue} = ${s.total}`;
  }
  if (step.phase === 'equal-check') entry = reasons['equal-check'];
  if (step.phase === 'move-left' || step.phase === 'move-right' || step.phase === 'less-check') {
    focus = ['pair'];
    variables.sum = `${s.total} vs ${target}`;
    const small = step.phase === 'move-left' || (step.phase === 'less-check' && s.total < target);
    entry = reasons[small ? 'less-check-small' : 'less-check-large'];
  }
  if (step.phase === 'found') {
    focus = ['pair', 'result'];
    variables.answer = `[${s.left + 1}, ${s.right + 1}]`;
  }
  if (step.phase === 'done') {
    focus = ['empty'];
    variables.answer = 'null';
  }
  if (previousStep && previousStep.phase === 'move-left' && step.phase === 'loop') variables.moved = 'left';
  if (previousStep && previousStep.phase === 'move-right' && step.phase === 'loop') variables.moved = 'right';
  return {
    title: entry[0],
    reason: entry[1],
    action: step.message,
    variables,
    focus,
  };
}
