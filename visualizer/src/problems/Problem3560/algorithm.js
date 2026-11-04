export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, m and k.')
  const { n, m, k } = input
  if (!Number.isInteger(k) || k < 2 || k > 100000) throw new Error('k is an integer from 2 to 100000.')
  for (const value of [n, m]) {
    if (!Number.isInteger(value) || value < 1 || value > 2 * k) throw new Error('n and m are integers from 1 to 2k.')
  }
  if (n > k && m > k) throw new Error('Both logs longer than k would need four trucks; at most one may exceed k.')
  return { n, m, k }
}

// At most 8 evenly spread smaller-piece lengths, always including both ends of the legal range.
function sampleCuts(low, high) {
  const span = high - low
  if (span < 8) return Array.from({ length: span + 1 }, (_, i) => low + i)
  const picks = new Set()
  for (let i = 0; i < 8; i++) picks.add(low + Math.round(span * i / 7))
  return [...picks]
}

export function buildTrace({ n, m, k }) {
  const frames = []
  const longest = Math.max(n, m)
  const longName = n >= m ? 'n' : 'm'
  let cut = null
  let tried = []
  let best = null
  let loaded = null
  const push = (phase, lineKey, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(lineKey), pythonLine: P(pyKey), message,
    longest: null, cut, tried: [...tried], best, loaded, ...extra,
  })
  push('start', 'measure both logs', 'def min_cutting_cost', `Logs ${n} and ${m}, truck limit ${k}.`)
  push('longest', 'pick the longest', 'longest = max', `The longest log is ${longName} = ${longest}.`, { longest })
  if (longest <= k) {
    loaded = [n, m]
    push('nocut', 'if it fits', 'return 0', `${longest} is at most ${k}, so both logs ride whole. Nothing is cut.`, { longest })
    push('done', 'if it fits', 'return 0', 'Return 0.', { longest })
    return { input: { n, m, k }, result: 0, frames }
  }
  const other = longName === 'n' ? m : n
  const low = longest - k
  const high = Math.floor(longest / 2)
  push('range', 'the other log takes', 'smallest_piece = longest - k',
    `${longest} exceeds ${k}. The other log (${other}) takes one truck, leaving two for two pieces. Each piece must be at most ${k}, so the shorter piece is from ${low} to ${high}.`, { longest, range: { low, high } })
  for (const a of sampleCuts(low, high)) {
    const b = longest - a
    const cost = a * b
    cut = { a, b }
    tried = [...tried, { a, b, cost }]
    const improves = best === null || cost < best.cost
    if (improves) best = { a, b, cost }
    push('try', 'compare the legal cuts', 'smallest_piece = longest - k',
      improves ? `Cut ${a} + ${b} costs ${a} × ${b} = ${cost}, the cheapest so far.` : `Cut ${a} + ${b} costs ${a} × ${b} = ${cost}, more than ${best.cost}. Evener pieces cost more.`,
      { longest, range: { low, high } })
  }
  cut = { a: low, b: k }
  best = { a: low, b: k, cost: low * k }
  loaded = [other, low, k]
  push('cut', 'cut off exactly k', 'smallest_piece = longest - k',
    `The most uneven legal cut wins: pieces ${low} and ${k}. All three pieces now fit.`, { longest, range: { low, high } })
  const result = k * low
  push('done', 'return k times', 'return k * smallest_piece', `Return ${k} × ${low} = ${result}.`, { longest, range: { low, high } })
  return { input: { n, m, k }, result, frames }
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Both logs drawn to scale against the limit k.' },
  { id: 'longest', label: 'Longest', description: 'Only the longest log can exceed the limit.' },
  { id: 'nocut', label: 'No cut', description: 'Both logs fit, so the cost is zero.' },
  { id: 'range', label: 'Legal cuts', description: 'Three trucks allow exactly one cut, and both pieces must fit.' },
  { id: 'try', label: 'Compare', description: 'For a fixed sum, a product shrinks as the two parts grow apart.' },
  { id: 'cut', label: 'Cut', description: 'Take the most uneven legal cut: k and the remainder.' },
  { id: 'done', label: 'Result', description: 'The minimum total cost.' },
]

export const code = `measure both logs against the limit k
pick the longest log
if it fits within k, return 0
the other log takes one truck, so the long log gets one cut into two pieces
compare the legal cuts: for a fixed sum, the product a times b falls as a and b grow apart
cut off exactly k, leaving longest minus k
return k times (longest minus k)`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_cutting_cost(n, m, k):
    longest = max(n, m)
    if longest <= k:
        return 0
    smallest_piece = longest - k
    return k * smallest_piece
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(t => t.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
