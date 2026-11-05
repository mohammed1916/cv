// Own two-pointer walkthrough. The sample values are invented for this visualization.
const CODE_TEXT = `function bestPairBelow(values, limit) {
  const sorted = [...values].sort((a, b) => a - b)
  let left = 0
  let right = sorted.length - 1
  let best = -1
  while (left < right) {
    const total = sorted[left] + sorted[right]
    if (total < limit) {
      best = Math.max(best, total)
      left++
    } else {
      right--
    }
  }
  return best
}`

export const python = `def best_pair_below(values, limit):
    values = sorted(values)
    left, right = 0, len(values) - 1
    best = -1
    while left < right:
        total = values[left] + values[right]
        if total < limit:
            best = max(best, total)
            left += 1
        else:
            right -= 1
    return best`

const PY = python.split('\n')
export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const STEP = {
  start: ['let left = 0', 'left, right ='],
  total: ['const total = sorted', 'total = values'],
  best: ['best = Math.max', 'best = max'],
  shrink: ['right--', 'right -= 1'],
  done: ['return best', 'return best'],
}
function lineOf(lines, key) {
  const index = lines.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, step, message, snapshot) => ({
  phase,
  activeLine: lineOf(CODE_TEXT.split('\n'), STEP[step][0]),
  pythonLine: lineOf(PY, STEP[step][1]),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Start', description: 'Sort the values and place pointers at both ends.' },
  { id: 'inspect', label: 'Inspect', description: 'Add the two pointed values and compare with the limit.' },
  { id: 'update', label: 'Record', description: 'A valid sum below the limit becomes the best so far.' },
  { id: 'done', label: 'Result', description: 'Return the best valid sum, or -1 if none exists.' },
]

export const inputLabel = 'JSON with values and limit, e.g. {"values":[4,1,9,6,3],"limit":10}'
export const complexity = 'O(n log n) time for the sort and O(n) for the scan. The visualizer accepts up to 12 values.'
export const examples = [
  { label: 'Sample', input: '{"values":[4,1,9,6,3],"limit":10}' },
  { label: 'Only one value', input: '{"values":[5],"limit":20}' },
  { label: 'Nothing fits', input: '{"values":[30,40,50],"limit":20}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.values) || !Number.isInteger(input.limit)) throw new Error('Use {"values":[...],"limit":n}.')
  if (input.values.length < 1 || input.values.length > 12) throw new Error('Use 1 to 12 values for the visualization.')
  for (const value of input.values) {
    if (!Number.isInteger(value) || value < 1 || value > 1000) throw new Error('Each value must be an integer from 1 to 1000.')
  }
  if (input.limit < 2 || input.limit > 2000) throw new Error('limit must be an integer from 2 to 2000.')
  return { values: [...input.values], limit: input.limit }
}

export function buildTrace(input) {
  const { values, limit } = input
  const sorted = [...values].sort((a, b) => a - b)
  let left = 0
  let right = sorted.length - 1
  let best = -1
  const snap = extra => ({ sorted: [...sorted], left, right, best, limit, ...extra })
  const frames = [frame('start', 'start', `Sorted order: ${sorted.join(', ')}. Pointers start at both ends.`, snap())]
  while (left < right) {
    const total = sorted[left] + sorted[right]
    frames.push(frame('inspect', 'total', `${sorted[left]} + ${sorted[right]} = ${total}; the limit is ${limit}.`, snap({ total })))
    if (total < limit) {
      best = Math.max(best, total)
      left += 1
      frames.push(frame('update', 'best', `${total} is below ${limit}, so it is the best valid sum so far. Move left inward.`, snap({ total })))
    } else {
      right -= 1
      frames.push(frame('inspect', 'shrink', `${total} is not below ${limit}. Move right inward to reduce the sum.`, snap({ total })))
    }
  }
  const result = best
  frames.push(frame('done', 'done', result === -1 ? 'No pair is strictly below the limit, so return -1.' : `Return ${result}.`, snap({ result })))
  return { input, result, frames }
}
