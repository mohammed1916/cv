export const phases = [
  { id: 'start', label: 'Start', description: 'No rectangle has been seen, so no pair exists yet.' },
  { id: 'reduce', label: 'Reduce the ratio', description: 'Divide width and height by their gcd; equal reduced pairs have equal ratios.' },
  { id: 'pair', label: 'Pair with earlier', description: 'Every earlier rectangle with the same reduced ratio forms one new pair.' },
  { id: 'done', label: 'Result', description: 'Return the total number of interchangeable pairs.' },
]

export const code = `function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b)
}

function countInterchangeablePairs(rectangles) {
  const seen = new Map()
  let pairs = 0
  for (const [width, height] of rectangles) {
    const g = gcd(width, height)
    const key = \`\${width / g}/\${height / g}\`
    const before = seen.get(key) ?? 0
    pairs += before
    seen.set(key, before + 1)
  }
  return pairs
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from math import gcd

def count_interchangeable_pairs(rectangles):
    seen = {}
    pairs = 0
    for width, height in rectangles:
        g = gcd(width, height)
        key = (width // g, height // g)
        before = seen.get(key, 0)
        pairs += before
        seen[key] = before + 1
    return pairs
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function parseInput(text) {
  let rects
  try { rects = JSON.parse(text) } catch { throw new Error('Use a JSON array of [width, height] pairs.') }
  if (!Array.isArray(rects) || rects.length < 1 || rects.length > 40) throw new Error('Give 1 to 40 rectangles here.')
  if (!rects.every(r => Array.isArray(r) && r.length === 2 && r.every(v => Number.isInteger(v) && v >= 1 && v <= 100000))) {
    throw new Error('Each rectangle is [width, height] with whole numbers from 1 to 100000.')
  }
  return rects
}

export function buildTrace(rects) {
  const frames = []
  const seen = new Map()
  let pairs = 0
  const add = (phase, c, p, message, index, key) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { rects, index, key, groups: [...seen.entries()], pairs },
  })
  add('start', 'const seen', 'seen = {}', 'No rectangle has been counted yet.', -1, null)
  rects.forEach(([width, height], i) => {
    const g = gcd(width, height)
    const key = `${width / g}/${height / g}`
    const before = seen.get(key) ?? 0
    pairs += before
    seen.set(key, before + 1)
    add('reduce', 'const g = gcd', 'g = gcd', `Rectangle ${i} (${width} x ${height}) has ratio ${key}.`, i, key)
    if (before > 0) add('pair', 'pairs += before', 'pairs += before', `${before} earlier rectangle(s) share ratio ${key}, adding ${before} pair(s).`, i, key)
  })
  add('done', 'return pairs', 'return pairs', `${pairs} interchangeable pair(s).`, rects.length - 1, null)
  return { input: rects, result: pairs, frames }
}
