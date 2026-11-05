// LeetCode 2171: Removing Minimum Number of Magic Beans.
// Sort the bags. If the kept bags all hold x beans, the bags with at least x beans can each keep x,
// so the cost of target x is total - x * (count of bags with at least x). Try every bag size as x.

const MAX_LEN = 12
const MAX_BEANS = 20

export function parseInput(text) {
  let beans
  try { beans = JSON.parse(text) } catch { throw new Error('Use a JSON array of positive integers, e.g. [4,1,6,5].') }
  if (!Array.isArray(beans) || beans.length < 1 || beans.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} bags. The visualization caps the count there.`)
  if (!beans.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_BEANS)) throw new Error(`Each bag holds an integer from 1 to ${MAX_BEANS}.`)
  return { beans }
}

export const code = `FUNCTION minimumRemoval(beans)
    sort beans in ascending order
    total ← sum of beans
    n ← length of beans
    best ← infinity
    FOR i from 0 to n - 1
        x ← beans[i]
        cost ← total - x * (n - i)
        best ← min(best, cost)
    RETURN best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_removal(beans):
    beans.sort()
    total = sum(beans)
    n = len(beans)
    best = float("inf")
    for i, x in enumerate(beans):
        cost = total - x * (n - i)
        best = min(best, cost)
    return best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Sorted', description: 'Sort the bags so every candidate target is a bag size.' },
  { id: 'try', label: 'Try a target', description: 'Keep x beans in every bag that has at least x; the others are emptied.' },
  { id: 'done', label: 'Result', description: 'The smallest removal over all targets.' },
]

export function buildTrace({ beans }) {
  const sorted = beans.slice().sort((a, b) => a - b)
  const n = sorted.length
  const total = sorted.reduce((a, b) => a + b, 0)
  let best = Infinity
  let bestAt = -1
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index, activeLine, pythonLine, message, sorted, total, n, best, bestAt, ...extra,
  })
  push('start', -1, L('sort beans'), P('beans.sort()'), `Sorted bags: ${sorted.join(', ')}. The total is ${total}.`)
  for (let i = 0; i < n; i++) {
    const x = sorted[i]
    const keep = n - i
    const cost = total - x * keep
    if (cost < best) { best = cost; bestAt = i }
    push('try', i, L('cost ← total'), P('cost = total'),
      `Target ${x}: ${keep} bags have at least ${x}, keeping ${x * keep} beans. Removal ${total} - ${x * keep} = ${cost}. Best ${best}.`,
      { x, keep, cost })
  }
  push('done', -1, L('RETURN best'), P('return best'), `The fewest beans to remove is ${best}.`)
  return { input: { beans }, result: best, frames }
}
