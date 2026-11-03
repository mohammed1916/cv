export const phases = [
  { id: 'start', label: 'Start', description: 'The first index holds its own value; the candidate window starts with index 0.' },
  { id: 'expire', label: 'Drop too far', description: 'Remove front candidates that are more than maxStep positions behind.' },
  { id: 'score', label: 'Best reachable', description: 'The front candidate has the highest reachable score in range.' },
  { id: 'push', label: 'Keep candidates', description: 'Remove weaker back candidates, then add this index as a candidate.' },
  { id: 'done', label: 'Return', description: 'The last index holds the best score that can end the game there.' },
]

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON object such as {"values": [1, -2, 3], "maxStep": 2}.') }
  if (!value || typeof value !== 'object' || !Array.isArray(value.values) || !Number.isInteger(value.maxStep)) {
    throw new Error('Provide a "values" array and an integer "maxStep".')
  }
  if (value.values.length < 1 || value.values.length > 1000) throw new Error('Use 1 to 1000 values.')
  if (!value.values.every(item => Number.isInteger(item) && item >= -10000 && item <= 10000)) throw new Error('Every value must be an integer from -10000 to 10000.')
  if (value.maxStep < 1 || value.maxStep > 1000) throw new Error('maxStep must be an integer from 1 to 1000.')
  return { values: value.values, maxStep: value.maxStep }
}

export function buildTrace({ values, maxStep }) {
  const n = values.length
  const best = new Array(n).fill(0)
  best[0] = values[0]
  const deque = [0]
  const snap = (i, expired = []) => ({ i, deque: deque.map(index => ({ index, score: best[index] })), current: i < n ? best[i] ?? null : null, expired })
  const frames = [{ phase: 'start', activeLine: 2, message: `best[0] = ${values[0]}. Candidate window holds index 0.`, snapshot: snap(0) }]
  for (let i = 1; i < n; i++) {
    const expired = []
    while (deque[0] < i - maxStep) expired.push(deque.shift())
    frames.push({ phase: 'expire', activeLine: 5, message: expired.length ? `Indices ${expired.join(', ')} are more than ${maxStep} behind ${i}.` : `No candidate is too far behind index ${i}.`, snapshot: snap(i, expired) })
    best[i] = values[i] + best[deque[0]]
    frames.push({ phase: 'score', activeLine: 6, message: `best[${i}] = ${values[i]} + best[${deque[0]}] = ${best[i]}.`, snapshot: snap(i) })
    const removed = []
    while (deque.length && best[deque.at(-1)] <= best[i]) removed.push(deque.pop())
    deque.push(i)
    frames.push({ phase: 'push', activeLine: 7, message: removed.length ? `Remove weaker candidates ${removed.join(', ')}; add ${i}.` : `Add ${i}; no weaker candidate at the back.`, snapshot: snap(i) })
  }
  frames.push({ phase: 'done', activeLine: 9, message: `Return best[${n - 1}] = ${best[n - 1]}.`, snapshot: { ...snap(n - 1), result: best[n - 1] } })
  return { input: { values, maxStep }, result: best[n - 1], frames }
}

export const python = `from collections import deque
def max_result(values, max_step):
    best = [0] * len(values)
    best[0] = values[0]
    window = deque([0])
    for i in range(1, len(values)):
        while window[0] < i - max_step:
            window.popleft()
        best[i] = values[i] + best[window[0]]
        while window and best[window[-1]] <= best[i]:
            window.pop()
        window.append(i)
    return best[-1]`

export const code = [
  'FUNCTION bestEndScore(values, maxStep)',
  '    best = array of length n; best[0] = values[0]',
  '    window = deque containing index 0',
  '    FOR i = 1 TO n - 1',
  '        REMOVE front indices older than i - maxStep',
  '        best[i] = values[i] + best[front of window]',
  '        REMOVE back indices whose best is at most best[i]',
  '        APPEND i to the back of window',
  '    RETURN best[n - 1]',
].map((text, index) => ({ line: index + 1, text }))

// Pseudocode activeLine -> Python line.
export const pythonLineMap = { 1: 2, 2: 4, 3: 5, 4: 6, 5: 7, 6: 9, 7: 10, 8: 12, 9: 13 }
