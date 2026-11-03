const PHASES = [
  { id: 'rotate', label: 'Rotate', description: 'Rotate the string left by r and start its cost at r.' },
  { id: 'pair', label: 'Mirror pair', description: 'Price the letters at mirrored positions with forward letter steps.' },
  { id: 'best', label: 'Best', description: 'Keep the cheapest rotation seen so far.' },
  { id: 'done', label: 'Answer', description: 'Report the fewest operations.' },
]

export const phases = PHASES

const CODE_LINES = [
  'minimum operations to make a rotated palindrome',
  'let n be the length of s',
  'for each left rotation r from 0 to n minus 1',
  '  t is s rotated left by r',
  '  cost starts at r',
  '  for each mirror pair i and n minus 1 minus i with i below the middle',
  '    d is the forward distance from t[i] to t[n minus 1 minus i] mod 26',
  '    add min(d, 26 minus d) to cost',
  '  keep the smallest cost',
  'return the smallest cost',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `def min_ops(s):
    n = len(s)
    best = None
    for r in range(n):
        t = s[r:] + s[:r]
        cost = r
        for i in range(n // 2):
            a = ord(t[i]) - 97
            b = ord(t[n - 1 - i]) - 97
            d = (b - a) % 26
            cost += min(d, 26 - d)
        if best is None or cost < best:
            best = cost
    return best
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 12 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 12 lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  const n = s.length
  const frames = []
  let best = null
  let bestRotation = -1
  const table = []
  frames.push({ pythonLine: P('def min_ops'), phase: 'rotate', activeLine: L('minimum operations'), r: -1, t: s, cost: 0, pairs: [], table: [], best, message: `Length ${n}. Try every left rotation.` })
  for (let r = 0; r < n; r++) {
    const t = s.slice(r) + s.slice(0, r)
    let cost = r
    const pairs = []
    frames.push({ pythonLine: P('t = s[r:]'), phase: 'rotate', activeLine: L('t is s rotated'), r, t, cost, pairs: [], table: [...table], best, message: `Rotate left by ${r} to get ${t}; the rotation alone costs ${r}.` })
    for (let i = 0; i < Math.floor(n / 2); i++) {
      const a = t.charCodeAt(i) - 97
      const b = t.charCodeAt(n - 1 - i) - 97
      const d = (((b - a) % 26) + 26) % 26
      const price = Math.min(d, 26 - d)
      cost += price
      pairs.push({ i, j: n - 1 - i, d, price })
      frames.push({ pythonLine: P('cost += min(d, 26 - d)'), phase: 'pair', activeLine: L('add min(d'), r, t, cost, pairs: [...pairs], table: [...table], best, message: `Positions ${i} and ${n - 1 - i} hold ${t[i]} and ${t[n - 1 - i]}; the cheaper way to match them costs ${price}.` })
    }
    table.push({ r, cost })
    if (best === null || cost < best) {
      best = cost
      bestRotation = r
      frames.push({ pythonLine: P('best = cost'), phase: 'best', activeLine: L('keep the smallest cost'), r, t, cost, pairs: [...pairs], table: [...table], best, message: `Rotation ${r} costs ${cost}, the cheapest so far.` })
    } else {
      frames.push({ pythonLine: P('if best is None'), phase: 'best', activeLine: L('keep the smallest cost'), r, t, cost, pairs: [...pairs], table: [...table], best, message: `Rotation ${r} costs ${cost}; the best stays ${best}.` })
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return the smallest cost'), r: bestRotation, t: s.slice(bestRotation) + s.slice(0, bestRotation), cost: best, pairs: [], table: [...table], best, message: `The fewest operations is ${best}, using rotation ${bestRotation}.` })
  return { input: { s }, result: best, frames }
}
