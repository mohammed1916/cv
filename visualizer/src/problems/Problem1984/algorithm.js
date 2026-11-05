export const phases = [
  { id: 'start', label: 'Sort scores', description: 'Sorting puts the scores that can be chosen together next to each other.' },
  { id: 'window', label: 'Window of k', description: 'The window from l to r holds k adjacent scores; its spread is the last minus the first.' },
  { id: 'done', label: 'Result', description: 'Return the smallest spread over all windows.' },
]

export const code = `function minimumDifference(nums, k) {
  const sorted = [...nums].sort((a, b) => a - b)
  let best = Infinity
  for (let left = 0; left + k - 1 < sorted.length; left++) {
    const right = left + k - 1
    best = Math.min(best, sorted[right] - sorted[left])
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_difference(nums, k):
    sorted_scores = sorted(nums)
    best = float('inf')
    for left in range(len(sorted_scores) - k + 1):
        right = left + k - 1
        best = min(best, sorted_scores[right] - sorted_scores[left])
    return best
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"nums":[9,4,1,7],"k":2}.') }
  const { nums, k } = obj || {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 1000) throw new Error('nums must have 1 to 1000 scores.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 100000)) throw new Error('Each score must be a whole number from 0 to 100000.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be from 1 to the number of scores.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const sorted = [...nums].sort((a, b) => a - b)
  let best = Infinity
  let bestWindow = [0, k - 1]
  const add = (phase, c, p, message, left, right, spread) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { sorted, k, left, right, spread, best, bestWindow },
  })
  add('start', 'const sorted', 'sorted_scores = sorted', `Sorted scores: ${sorted.join(', ')}.`, -1, -1, null)
  for (let left = 0; left + k - 1 < sorted.length; left++) {
    const right = left + k - 1
    const spread = sorted[right] - sorted[left]
    if (spread < best) { best = spread; bestWindow = [left, right] }
    add('window', 'for (let left', 'for left in range', `Window ${left} to ${right} spreads ${spread}; best so far is ${best}.`, left, right, spread)
  }
  add('done', 'return best', 'return best', `The smallest spread of ${k} scores is ${best}.`, bestWindow[0], bestWindow[1], best)
  return { input: { nums, k }, result: best, frames }
}
