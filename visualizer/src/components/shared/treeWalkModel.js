/**
 * Pure model for tree-walk state: the pending calls (recursion), the explicit stack or queue, the visit order
 * built so far, and the decision made at the current node. Entries are plain { label, note? } objects with the
 * bottom of a stack (or the back of a queue) first.
 */
export const WALK_KINDS = {
  recursion: { title: 'Call stack — the innermost call is on top and finishes first', top: 'running', edge: 'last' },
  stack: { title: 'Explicit stack — the top is popped next', top: 'next pop', edge: 'last' },
  queue: { title: 'Queue — the front is processed next', top: 'front', edge: 'first' },
}
export const WALK_ROW_CAP = 16

/** Normalise a walk. `stack: null` means this walk has no pending structure (a single search path, for example). */
export function treeWalk({ kind = 'recursion', stack = null, order = [], orderLabel = 'Visit order so far', decision = '' } = {}) {
  return {
    kind: WALK_KINDS[kind] ? kind : 'recursion',
    stack: stack === null ? null : stack.map(e => (typeof e === 'object' && e !== null ? { label: String(e.label), note: e.note ?? '' } : { label: String(e), note: '' })),
    order: [...order], orderLabel, decision,
  }
}

/** Rows to draw, most urgent first, capped; `hidden` counts the older entries left out. */
export function stackRows(walk, cap = WALK_ROW_CAP) {
  if (!walk.stack) return { rows: [], hidden: 0, depth: 0 }
  const meta = WALK_KINDS[walk.kind]
  const ordered = meta.edge === 'last' ? [...walk.stack].reverse() : [...walk.stack]
  const rows = ordered.slice(0, cap).map((entry, i) => ({ ...entry, tag: i === 0 ? meta.top : '' }))
  return { rows, hidden: Math.max(0, ordered.length - cap), depth: ordered.length }
}

/** One sentence summarising the pending work, for the heading and for tests. */
export function describeWalkStack(walk) {
  if (!walk.stack) return ''
  const { depth } = stackRows(walk)
  if (!depth) return walk.kind === 'recursion' ? 'No calls are pending.' : walk.kind === 'queue' ? 'The queue is empty.' : 'The stack is empty.'
  const noun = walk.kind === 'recursion' ? (depth === 1 ? 'call' : 'calls') : 'entries'
  const labels = walk.stack.map(e => e.label)
  const chain = walk.kind === 'queue' ? labels.join(', ') : labels.join(' → ')
  return `${depth} ${walk.kind === 'recursion' ? 'pending ' : ''}${noun}: ${chain}`
}
