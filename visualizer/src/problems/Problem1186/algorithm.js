export const phases = [
  { id: 'start', label: 'Seed states', description: 'The first value starts a kept run; no deletion has happened yet.' },
  { id: 'delete', label: 'Deleted state', description: 'Either extend an earlier deletion, or delete the current value from the kept run before it.' },
  { id: 'keep', label: 'Kept state', description: 'Extend the kept run, or restart at the current value.' },
  { id: 'record', label: 'Best so far', description: 'Compare both states with the best answer found so far.' },
  { id: 'done', label: 'Answer', description: 'Return the best nonempty result after at most one deletion.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  const arr = data?.arr
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 40) throw new Error('arr must be an array of 1 to 40 integers.')
  if (arr.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('Each value must be an integer with absolute value at most 10000.')
  return { arr }
}

export function buildTrace({ arr }) {
  const frames = []
  let keep = arr[0]
  let deleted = Number.NEGATIVE_INFINITY
  let best = arr[0]
  const history = [{ keep, deleted, best }]
  const snap = (index, extra = {}) => ({ arr, index, keep, deleted, best, history: [...history], ...extra })

  frames.push({ phase: 'start', activeLine: 2, pythonLine: 2, message: `Start with ${arr[0]}. Its kept run is ${keep}, and no deletion exists yet.`, snapshot: snap(0) })
  for (let i = 1; i < arr.length; i++) {
    const oldKeep = keep
    deleted = Math.max(deleted + arr[i], oldKeep)
    frames.push({ phase: 'delete', activeLine: 6, pythonLine: 4, message: `Deleted state at ${i}: ${arr[i]} is either added to the old deleted state or removed while keeping ${oldKeep}. The better value is ${deleted}.`, snapshot: snap(i) })
    keep = Math.max(keep + arr[i], arr[i])
    frames.push({ phase: 'keep', activeLine: 7, pythonLine: 5, message: `Kept state at ${i}: extend the run to get ${keep}, or restart at ${arr[i]}, whichever is larger.`, snapshot: snap(i) })
    best = Math.max(best, keep, deleted)
    history.push({ keep, deleted, best })
    frames.push({ phase: 'record', activeLine: 8, pythonLine: 6, message: `Compare kept ${keep} and deleted ${deleted} with the best ${best}.`, snapshot: snap(i) })
  }
  frames.push({ phase: 'done', activeLine: 10, pythonLine: 7, message: `The best nonempty result is ${best}.`, snapshot: snap(arr.length - 1, { done: true }) })
  return { input: { arr }, result: best, frames }
}

export const code = `function maximumSumAfterOneDeletion(arr) {
  let keep = arr[0]
  let deleted = -Infinity
  let best = arr[0]
  for (let i = 1; i < arr.length; i++) {
    deleted = Math.max(deleted + arr[i], keep)
    keep = Math.max(keep + arr[i], arr[i])
    best = Math.max(best, keep, deleted)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def best_after_one_deletion(arr):
    keep, deleted, best = arr[0], float("-inf"), arr[0]
    for i in range(1, len(arr)):
        deleted = max(deleted + arr[i], keep)
        keep = max(keep + arr[i], arr[i])
        best = max(best, keep, deleted)
    return best`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 }
