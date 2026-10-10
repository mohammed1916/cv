const chapters = ['Measure the differences', 'Find the optimal ceiling', 'Spend leftover operations', 'Square and sum'];
export function minimumSumSquaredDifferenceNarrative({ step, input }) {
  const base = {
    goal: 'Minimize the sum of squared absolute differences using at most k1 + k2 unit changes.',
    chapters,
    edgeCases: [
      'If the total operation budget covers every difference, the answer is zero.',
      'If no operations are available, square the original differences.',
      'Several positions may share the same largest difference.',
      'Large inputs require BigInt arithmetic for exact squared sums in JavaScript.',
    ],
    strategyLabel: 'Binary search for the smallest affordable maximum difference',
    chapter: 0,
    scope: input ? `Arrays of length ${input.nums1.length}; combined budget ${input.k1 + input.k2}` : 'Ready',
    activeLine: step?.activeLine,
    why: 'Lowering a larger difference by one saves more squared error than lowering a smaller one.',
    achieved: 'No differences have been processed yet.',
    next: 'Compute absolute differences and the available operation budget.',
  };
  if (!step) return base;
  const phase = step.phase;
  const state = { why: step.message, achieved: step.message, next: 'Continue to the next code line.' };
  if (['differences', 'budget', 'capacity', 'zero'].includes(phase)) {
    state.chapter = 0;
    state.why = 'Only the absolute differences matter. One operation can reduce a positive difference by one.';
    state.achieved = `Initial squared error: ${step.initialSum}. Total absolute difference: ${step.totalDifference}.`;
    state.next = step.totalDifference <= step.budget ? 'Every difference can become zero.' : 'Find the smallest reachable maximum difference.';
  } else if (['search-init', 'mid', 'cost-init', 'cost-item', 'decision', 'bounds'].includes(phase)) {
    state.chapter = 1;
    state.why = 'A ceiling is feasible when the cost of reducing every difference above it does not exceed the budget.';
    state.achieved = step.mid == null ? 'Binary search bounds are initialized.' : `Ceiling ${step.mid}: ${step.required} operations required; ${step.budget} available.`;
    state.next = 'Keep the feasible half or the infeasible half of the search range.';
  } else if (['threshold', 'clamp', 'remaining', 'leftover', 'leftover-skip'].includes(phase)) {
    state.chapter = 2;
    state.why = 'After reaching the smallest feasible ceiling, remaining operations should lower entries equal to that ceiling.';
    state.achieved = `Current differences: [${step.current.join(', ')}]. Remaining operations: ${step.remaining}.`;
    state.next = 'Finish applying the leftover operations and compute squared error.';
  } else if (['square', 'done'].includes(phase)) {
    state.chapter = 3;
    state.why = 'The objective is the sum of the squared final absolute differences.';
    state.achieved = `Squared-error total so far: ${step.sum}.`;
    state.next = phase === 'done' ? 'Try another example or inspect earlier decisions.' : 'Add the next squared difference.';
  }
  return { ...base, ...state };
}
