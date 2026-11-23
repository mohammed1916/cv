// Reason-first script for Query Batching.
const spoken = {
  start: 'Here is the big picture. We walk through the values once, filling a batch until it holds k items, then starting the next one. Each batch keeps a running sum, so we never add the values again.',
  add: 'Now this value joins the open batch. The batch sum grows by the value, and that is all this step needs to do.',
  close: 'The batch cannot take another value, so its sum is final. We record it and start a new batch with a sum of zero.',
  done: 'Every value has been placed, so the recorded sums are the answer.',
}
const why = {
  start: 'A single pass keeps the work proportional to the number of values.',
  add: 'Adding to a running sum avoids summing the batch again each time.',
  close: 'A full batch must be recorded before the next value is placed, or its sum would be lost.',
  done: 'All batches have been recorded in order.',
}
export function batchTutorial({ step }) {
  return {
    title: step.phase === 'close' ? 'Close a batch' : step.phase === 'add' ? 'Add a value' : step.phase === 'done' ? 'Result' : 'Start',
    reason: why[step.phase] ?? why.start,
    spoken: { reason: spoken[step.phase] ?? spoken.start },
    action: step.message,
    variables: { current: step.current, batches: step.sums.length },
    focus: [],
  }
}
