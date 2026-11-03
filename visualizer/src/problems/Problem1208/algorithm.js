// Independently authored sliding-window walkthrough. The strings and budgets are our own sample data.
const MAX_LENGTH = 40

export const code = [
  { line: 1, text: 'cost[i] = |s[i] - t[i]| for every position i' },
  { line: 2, text: 'left = 0; spent = 0; best = 0' },
  { line: 3, text: 'for right from 0 to the last position:' },
  { line: 4, text: '  spent = spent + cost[right]' },
  { line: 5, text: '  while spent > maxCost: spent = spent - cost[left]; left = left + 1' },
  { line: 6, text: '  best = max(best, right - left + 1)' },
  { line: 7, text: 'return best' },
]

export const python = `def equal_substring(s, t, maxCost):
    costs = [abs(ord(a) - ord(b)) for a, b in zip(s, t)]
    left = 0
    spent = 0
    best = 0
    for right in range(len(s)):
        spent += costs[right]
        while spent > maxCost:
            spent -= costs[left]
            left += 1
        best = max(best, right - left + 1)
    return best`

export const pythonLineMap = { 1: 2, 2: 4, 3: 6, 4: 7, 5: 8, 6: 11, 7: 12 }

export const phases = [
  { id: 'start', label: 'Costs', description: 'Price every position by its character distance. Nothing is spent yet.' },
  { id: 'inspect', label: 'Extend window', description: 'Add the next position to the window and charge its cost.' },
  { id: 'update', label: 'Shrink or record', description: 'Drop positions from the left while over budget, then record the longest window.' },
  { id: 'done', label: 'Result', description: 'Return the longest window that fits the budget.' },
]

export const inputLabel = 'Object with s, t and maxCost (JSON), e.g. {"s":"abc","t":"abd","maxCost":1}'
export const complexity = 'O(n) time and O(n) memory for the cost array. Each position enters and leaves the window at most once. The visualization accepts up to 40 letters.'
export const examples = [
  { label: 'Budget grows and shrinks across different costs', input: '{"s":"cedarforest","t":"befbsdorftu","maxCost":7}' },
  { label: 'Zero budget keeps only equal positions', input: '{"s":"abccdef","t":"abzzdef","maxCost":0}' },
  { label: 'All positions fit', input: '{"s":"moss","t":"nptt","maxCost":20}' },
  { label: 'No position fits', input: '{"s":"aaaa","t":"zzzz","maxCost":4}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string' || typeof input.t !== 'string') {
    throw new Error('Use an object with string s and t, plus maxCost, such as {"s":"abc","t":"abd","maxCost":1}.')
  }
  const { s, t, maxCost } = input
  if (!/^[a-z]{1,40}$/.test(s) || !/^[a-z]{1,40}$/.test(t)) throw new Error('s and t must be 1 to 40 lowercase letters.')
  if (s.length !== t.length) throw new Error('s and t must have the same length.')
  if (!Number.isInteger(maxCost) || maxCost < 0 || maxCost > 100) throw new Error('maxCost must be an integer from 0 to 100.')
  return { s, t, maxCost }
}

export function buildTrace({ s, t, maxCost }) {
  const n = s.length
  const cost = [...s].map((ch, i) => Math.abs(ch.charCodeAt(0) - t.charCodeAt(i)))
  const frames = []
  let left = 0
  let spent = 0
  let best = 0
  const snap = (right, extra = {}) => ({
    cost: [...cost], left, right, spent, best, maxCost, window: right >= 0 ? [left, right] : [], ...extra,
  })
  frames.push({ phase: 'start', activeLine: 1, message: `Each position costs its character distance. The budget is ${maxCost}.`, snapshot: snap(-1) })
  for (let right = 0; right < n; right++) {
    spent += cost[right]
    frames.push({ phase: 'inspect', activeLine: 4, message: `Include position ${right} (cost ${cost[right]}). Spent ${spent} of ${maxCost}.`, snapshot: snap(right) })
    while (spent > maxCost) {
      spent -= cost[left]
      left += 1
      frames.push({ phase: 'update', activeLine: 5, message: `Over budget: drop position ${left - 1} (cost ${cost[left - 1]}). Spent ${spent}.`, snapshot: snap(right) })
    }
    best = Math.max(best, right - left + 1)
    frames.push({ phase: 'update', activeLine: 6, message: `Window ${left} to ${right} has length ${right - left + 1}. Best is ${best}.`, snapshot: snap(right) })
  }
  frames.push({ phase: 'done', activeLine: 7, message: `Return ${best}.`, snapshot: snap(n - 1) })
  return { input: { s, t, maxCost }, result: best, frames }
}
