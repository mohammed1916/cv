export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a heights list.')
  const { heights } = input
  if (!Array.isArray(heights) || heights.length < 1 || heights.length > 8) throw new Error('heights is a list of 1 to 8 originals.')
  if (!heights.every(h => Number.isInteger(h) && h >= 1 && h <= 1000)) throw new Error('Each height is an integer from 1 to 1000.')
  return { heights }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

export function buildTrace({ heights }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)

  const count = new Map()
  for (const h of heights) count.set(h, (count.get(h) || 0) + 1)
  const values = [...count.keys()].sort((a, b) => a - b)
  const candidates = new Set(values)
  for (let i = 0; i < values.length; i++) {
    for (let j = i; j < values.length; j++) candidates.add(values[i] + values[j])
  }
  const order = [...candidates].sort((a, b) => a - b)

  let best = 0
  let bestHeight = null
  frames.push({ phase: 'start', activeLine: L('count how many originals'), pythonLine: P('count[h] = count.get'), values, candidate: null, singles: 0, pairs: 0, total: 0, best, bestHeight, message: `Originals have ${values.length} distinct heights; ${order.length} candidate heights to test.` })

  for (const h of order) {
    const singles = count.get(h) || 0
    let pairs = 0
    for (const a of values) {
      const b = h - a
      if (a < b && count.has(b)) pairs += Math.min(count.get(a), count.get(b))
    }
    if (h % 2 === 0 && count.has(h / 2)) pairs += Math.floor(count.get(h / 2) / 2)
    const total = singles + pairs
    if (total > best) {
      best = total
      bestHeight = h
    }
    frames.push({ phase: 'candidate', activeLine: L('singles = count of originals'), pythonLine: P('singles = count.get(h'), values, candidate: h, singles, pairs, total, best, bestHeight, message: `Height ${h}: ${singles} as singles plus ${pairs} pairs gives ${total} planks${total > 0 && total === best ? ', the best so far' : ''}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), values, candidate: null, singles: 0, pairs: 0, total: best, best, bestHeight, result: best, message: `The widest fence has ${best} planks at height ${bestHeight}.` })
  return { input: { heights }, result: best, frames }
}

export const code = `widest equal-height fence built from the originals
count how many originals have each height
best = 0
for each candidate height h, every height and every sum of two heights
  singles = count of originals with height h
  pairs = disjoint pairs of other heights that add to h
  best = max(best, singles plus pairs)
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def widest_possible_fence(heights):
    count = {}
    for h in heights:
        count[h] = count.get(h, 0) + 1
    values = sorted(count)
    candidates = set(values)
    for i in range(len(values)):
        for j in range(i, len(values)):
            candidates.add(values[i] + values[j])
    best = 0
    for h in candidates:
        singles = count.get(h, 0)
        pairs = 0
        for a in values:
            b = h - a
            if a < b and b in count:
                pairs += min(count[a], count[b])
        if h % 2 == 0 and h // 2 in count:
            pairs += count[h // 2] // 2
        best = max(best, singles + pairs)
    return best
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
