// Authored for Jump Game VII: each scene explains one window operation on the reachable flags.
const reasons = {
  init: ['Seed the first landing', 'Jumps only move forward, so position 0 is the only certain starting point. Every later decision reads this flag.'],
  loop: ['Find the launch window', 'A jump from j to i needs minJump <= i - j <= maxJump. Only the positions in that band can land at i, so no other earlier position matters.'],
  enter_check: ['Test the new right edge', 'As i grows, the newest legal launch is i - minJump. It exists only when that index is nonnegative.'],
  enter: ['Count the entering launch', 'Whether it can launch is a yes/no flag. A reachable entrant adds one launch to the running count, so the window never has to be rescanned.'],
  leave_check: ['Test the old left edge', 'Positions farther than maxJump away are no longer legal launches for i. The one at i - maxJump - 1 is the candidate to drop.'],
  leave: ['Drop the expired launch', 'If the expired position was reachable, it must stop contributing. Subtracting it keeps the count equal to the reachable positions in the window.'],
  update: ['Decide this destination', 'A zero can be reached when at least one reachable launch remains in the window. A one is a blocked cell, regardless of the count.'],
  done: ['Return the final position', 'The answer is the reachability of the last index, which was decided with the same window rule as every other position.'],
};

export function jumpWindowTutorial({ step, previousStep }) {
  const w = step.jumpWindow || {};
  const range = w.earliest === null ? 'empty' : `[${w.earliest}..${w.latest}]`;
  let entry = reasons[step.codeStage] || reasons.loop;
  let focus = ['window'];
  const variables = {};
  if (step.phase === 'start' || step.codeStage === 'init') { focus = ['reachable']; variables.reachable = 'R0'; }
  if (w.destination !== undefined && step.codeStage !== 'init') variables.destination = w.destination;
  if (step.codeStage === 'loop') { variables.window = range; focus = w.earliest === null ? ['empty'] : ['window']; }
  if (step.codeStage === 'enter_check') {
    focus = w.entering === null ? ['empty'] : ['entering'];
    variables.entering = w.entering === null ? 'none (i < minJump)' : w.entering;
    if (w.entering === null) entry = ['Nothing enters yet', 'The newest legal launch index is still negative, so the count has no new candidate. This check is a real decision even though no flag changes.'];
  }
  if (step.codeStage === 'enter') { focus = ['entering', 'count']; variables.entering = w.entering; variables.count = w.count; }
  if (step.codeStage === 'leave_check') {
    focus = w.leaving === null ? ['empty'] : ['leaving'];
    variables.leaving = w.leaving === null ? 'none (within maxJump)' : w.leaving;
    if (w.leaving === null) entry = ['Nothing has expired', 'Every position still in the window is within maxJump of the destination, so the count is not reduced on this step.'];
  }
  if (step.codeStage === 'leave') { focus = ['leaving', 'count']; variables.leaving = w.leaving; variables.count = w.count; }
  if (step.codeStage === 'update') {
    focus = ['decision'];
    variables.count = w.count;
    variables.decided = w.decided === null ? 'pending' : w.decided ? 'reachable' : 'unreachable';
    entry = w.blocked
      ? ['Blocked cell stays unreachable', 'This destination is a one. Even when the window holds reachable launches, a blocked cell cannot be landed on.']
      : w.decided ? ['Reachable landing', 'The destination is open and at least one reachable launch lies in the window. It joins the reachable set for later windows.']
        : ['Open cell with no launch', 'The destination is open, but no reachable position lies in the legal window, so it cannot be reached.'];
  }
  if (step.phase === 'done') { focus = ['result']; variables.result = step.output?.at(-1) ? 'reachable' : 'unreachable'; entry = reasons.done; }
  return {
    title: entry[0],
    reason: entry[1],
    action: step.message,
    variables,
    focus,
  };
}
