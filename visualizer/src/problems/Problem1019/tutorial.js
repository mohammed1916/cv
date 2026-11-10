// Authored teaching for the monotonic stack. Each scene names the real positions and values that cause the operation.
const reasons = {
  start: ['Begin with zero answers and an empty stack', 'A position that never meets a larger later value keeps 0, so zero is the right answer until a later value proves otherwise. The stack starts empty because no position is waiting yet.'],
  read: ['Read the next value in list order', 'The list is scanned once, left to right. This value may be the first larger value for earlier positions that are still waiting, so it is compared with the stack before it joins.'],
  'check-empty': ['Nothing is waiting', 'The stack is empty, so no earlier position is unresolved. There is nothing to compare, and the current value simply waits.'],
  'check-pop': ['The top waiting value is smaller', 'The stack keeps values in decreasing order from bottom to top, so the top is the smallest waiting value. This value is larger than it, so the top has found its next greater value. Positions below may also be smaller, so the comparison repeats.'],
  'check-keep': ['The top is not smaller, so the scan stops', 'Every position below the top holds a value at least as large as the top. If the top is not smaller than this value, none of the waiting positions can be resolved by it.'],
  pop: ['Remove the resolved position', 'A position needs only one answer, the first larger value after it. Removing it now keeps the stack decreasing, and it is never compared again, so each position is removed at most once.'],
  assign: ['Record this value as the answer', 'This value comes after the popped position and is larger than its value, so it is that position\'s next greater value. A later larger value cannot replace it, because the first one is the answer. The position can never be an answer again.'],
  push: ['Wait for a larger value', 'Every waiting position that was smaller has just been resolved, so the top is at least as large as this value. This position has no answer yet and joins the top to keep the stack decreasing.'],
  result: ['Positions still waiting keep 0', 'The list has ended, so nothing can resolve the positions left on the stack. They had no greater value after them and keep the 0 they started with.'],
}

export function nextGreaterTutorial({ step }) {
  const key = step.kind === 'check' ? (step.top === null ? 'check-empty' : step.compare ? 'check-pop' : 'check-keep') : step.kind
  const [title, reason] = reasons[key] ?? reasons.read
  const focus = {
    kind: step.kind,
    index: step.index ?? null,
    value: step.value ?? null,
    top: step.top ?? null,
    topValue: step.topValue ?? null,
    compare: step.compare ?? null,
    popped: step.popped ?? null,
    stack: step.stack,
  }
  const variables = {
    start: { answer: 'all 0', stack: 'empty' },
    read: { position: step.index, value: step.value },
    check: { top: step.top, topValue: step.topValue, value: step.value, smaller: step.compare },
    pop: { popped: step.popped, value: step.value },
    assign: { position: step.popped, answer: step.value },
    push: { position: step.index, value: step.value },
    result: { answer: step.answer.join(', ') },
  }[step.kind] ?? {}
  return { title, reason, action: step.message, variables, focus }
}
