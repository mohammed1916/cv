// Reason-first script for the sliding window.
const spokenReasons = {
  start: 'Here is the big picture. We want the longest stretch of ones after we are allowed to flip one zero. A window that contains at most one zero is exactly that stretch, so we slide it across the array and keep the largest size.',
  right: 'Now the right edge moves one step forward. Adding a value can only make the window longer, so we check whether the window is still valid.',
  zero: 'This value is a zero. It uses up the one zero we are allowed to flip, so we count it.',
  shrink: 'The window now has two zeros. It is no longer valid, so the left edge moves forward until one zero is left inside.',
  best: 'The window is valid now. Its length is a candidate for the answer, so we keep the larger of the two.',
  done: 'Every position has been checked, and the best length is the answer.',
}

const reasons = {
  start: 'A sliding window avoids checking every pair of edges. Each edge moves only forward.',
  right: 'Moving the right edge adds one value to the window, which is the only change that can make it invalid.',
  zero: 'A zero is the only value that counts against the one flip allowed.',
  shrink: 'Removing values from the left, until at most one zero remains, makes the window valid again.',
  best: 'The best run is the largest valid window seen so far.',
  done: 'Every window has been considered.',
}

export function onesTutorial({ step }) {
  return {
    title: reasons[step.phase] ? step.phase[0].toUpperCase() + step.phase.slice(1) : 'Next step',
    reason: reasons[step.phase] ?? reasons.start,
    spoken: { reason: spokenReasons[step.phase] ?? spokenReasons.start },
    action: step.message,
    variables: { left: step.left, right: step.right, zeros: step.zeros, best: step.best },
    focus: [],
  }
}
