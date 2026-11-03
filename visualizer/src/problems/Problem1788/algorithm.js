export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with flowers.')
  const { flowers } = input
  if (!Array.isArray(flowers) || flowers.length < 2 || flowers.length > 12) throw new Error('flowers has 2 to 12 beauty values in this visualization.')
  if (!flowers.every(v => Number.isInteger(v) && v >= -20 && v <= 20)) throw new Error('Each beauty value is an integer from -20 to 20.')
  const seen = new Set()
  let pair = false
  for (const v of flowers) { if (seen.has(v)) pair = true; seen.add(v) }
  if (!pair) throw new Error('At least two flowers must share a beauty value to be endpoints.')
  return { flowers }
}

export const code = `find the best garden with equal first and last flowers
  build prefix sums of the positive beauty values
  set best_left to an empty map and best to nothing
  for each flower j from left to right
    if best_left has an entry for the value of flower j
      candidate = best_left[value] + value + prefix[j]
      keep the larger of best and candidate
    store value minus prefix[j + 1] in best_left if it beats the entry
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const line = code.findIndex(c => c.text.includes(s))
  if (line < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return line + 1
}

export const python = `def max_beauty(flowers):
    n = len(flowers)
    prefix = [0] * (n + 1)
    for k in range(n):
        prefix[k + 1] = prefix[k] + max(0, flowers[k])
    best_left = {}
    best = None
    for j in range(n):
        v = flowers[j]
        if v in best_left:
            total = best_left[v] + v + prefix[j]
            if best is None or total > best:
                best = total
        left_score = v - prefix[j + 1]
        if v not in best_left or left_score > best_left[v]:
            best_left[v] = left_score
    return best
`
const P = s => {
  const line = python.split('\n').findIndex(p => p.includes(s))
  if (line < 0) throw new Error(`Missing python line: ${s}`)
  return line + 1
}

export const phases = [
  { id: 'setup', label: 'Setup', description: 'Prepare the prefix sums and the left map.' },
  { id: 'prefix', label: 'Prefix', description: 'Add each positive beauty to the running sum.' },
  { id: 'scan', label: 'Scan', description: 'Visit the next flower as a right endpoint.' },
  { id: 'pair', label: 'Pair', description: 'Combine with an earlier flower of the same value.' },
  { id: 'store', label: 'Store', description: 'Remember this flower as a possible left endpoint.' },
  { id: 'done', label: 'Result', description: 'Report the best total.' },
]

export function buildTrace({ flowers }) {
  const n = flowers.length
  const frames = []
  const prefix = [0]
  frames.push({ pythonLine: P('n = len'), phase: 'setup', activeLine: L('build prefix sums'), j: -1, prefix: [0], left: {}, best: null, candidate: null, leftAt: null, message: 'Prefix sums count only the positive beauty values strictly between two endpoints.' })
  for (let k = 0; k < n; k++) {
    prefix.push(prefix[k] + Math.max(0, flowers[k]))
    frames.push({ pythonLine: P('prefix[k + 1]'), phase: 'prefix', activeLine: L('build prefix sums'), j: -1, prefix: [...prefix], left: {}, best: null, candidate: null, leftAt: null, message: `Prefix after flower ${k} is ${prefix[k + 1]}.` })
  }
  const bestLeft = new Map()
  const leftAt = new Map()
  let best = null
  frames.push({ pythonLine: P('best_left = {}'), phase: 'setup', activeLine: L('set best_left to an empty map'), j: -1, prefix: [...prefix], left: {}, best: null, candidate: null, leftAt: null, message: 'No left endpoint has been seen yet.' })
  for (let j = 0; j < n; j++) {
    const v = flowers[j]
    frames.push({ pythonLine: P('v = flowers[j]'), phase: 'scan', activeLine: L('for each flower j'), j, prefix: [...prefix], left: Object.fromEntries(bestLeft), best, candidate: null, leftAt: leftAt.get(v) ?? null, message: `Flower ${j} has beauty ${v} and becomes the right endpoint.` })
    if (bestLeft.has(v)) {
      const total = bestLeft.get(v) + v + prefix[j]
      if (best === null || total > best) best = total
      frames.push({ pythonLine: P('total = best_left'), phase: 'pair', activeLine: L('candidate = best_left'), j, prefix: [...prefix], left: Object.fromEntries(bestLeft), best, candidate: total, leftAt: leftAt.get(v), message: `Pairing with left ${leftAt.get(v)} gives ${total}; best is ${best}.` })
    } else {
      frames.push({ pythonLine: P('if v in best_left'), phase: 'pair', activeLine: L('if best_left has an entry'), j, prefix: [...prefix], left: Object.fromEntries(bestLeft), best, candidate: null, leftAt: null, message: `No earlier flower has beauty ${v}, so no pair ends here.` })
    }
    const score = v - prefix[j + 1]
    if (!bestLeft.has(v) || score > bestLeft.get(v)) {
      bestLeft.set(v, score)
      leftAt.set(v, j)
      frames.push({ pythonLine: P('best_left[v] = '), phase: 'store', activeLine: L('store value minus'), j, prefix: [...prefix], left: Object.fromEntries(bestLeft), best, candidate: null, leftAt: j, message: `Store ${score} for value ${v} as a left endpoint at ${j}.` })
    } else {
      frames.push({ pythonLine: P('if v not in best_left or'), phase: 'store', activeLine: L('store value minus'), j, prefix: [...prefix], left: Object.fromEntries(bestLeft), best, candidate: null, leftAt: leftAt.get(v), message: `Keep the earlier left endpoint for value ${v}; its score ${bestLeft.get(v)} is higher.` })
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), j: n, prefix: [...prefix], left: Object.fromEntries(bestLeft), best, candidate: null, leftAt: null, message: `Best garden beauty is ${best}.` })
  return { input: { flowers }, result: best, frames }
}
