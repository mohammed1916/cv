export const phases = [
  { id: 'start', label: 'Start', description: 'Start with zero flips and walk the bit positions from the lowest upward.' },
  { id: 'read', label: 'Read bits', description: 'Read the same bit position from a, b and c.' },
  { id: 'one', label: 'Target bit is 1', description: 'a or b must supply this bit. Only a position where both are 0 costs one flip.' },
  { id: 'zero', label: 'Target bit is 0', description: 'Every set bit of a or b at this position must be cleared, one flip each.' },
  { id: 'done', label: 'Complete', description: 'Return the total number of flips across all bit positions.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"a": 2, "b": 6, "c": 5}.')
  const { a, b, c } = input
  for (const [name, value] of [['a', a], ['b', b], ['c', c]]) {
    if (!Number.isInteger(value) || value < 0 || value > 1000) throw new Error(`${name} is an integer from 0 to 1000.`)
  }
  return { a, b, c }
}

const BIT_COUNT = 10

export function buildTrace({ a, b, c }) {
  const rows = []
  let flips = 0
  const frames = []
  const snap = (bit, x, y, z) => ({ bit, x, y, z, flips, rows: [...rows] })
  frames.push({ phase: 'start', activeLine: L('flips = 0'), pythonLine: P('flips = 0'), snapshot: snap(null, null, null, null), message: `Compare the bits of a=${a}, b=${b} and c=${c} from the lowest position upward.` })
  for (let k = 0; k < BIT_COUNT; k++) {
    const x = (a >> k) & 1
    const y = (b >> k) & 1
    const z = (c >> k) & 1
    frames.push({ phase: 'read', activeLine: L('for each bit'), pythonLine: P('for k in range'), snapshot: snap(k, x, y, z), message: `Bit ${k}: a=${x}, b=${y}, c=${z}.` })
    let cost
    if (z === 1) {
      cost = x === 0 && y === 0 ? 1 : 0
      flips += cost
      frames.push({ phase: 'one', activeLine: L('if z == 1'), pythonLine: P('if z == 1'), snapshot: snap(k, x, y, z), message: cost ? 'c needs a 1 here and both a and b have 0, so one flip is required.' : 'c needs a 1 here and a or b already supplies it, so no flip.' })
    } else {
      cost = x + y
      flips += cost
      frames.push({ phase: 'zero', activeLine: L('else'), pythonLine: P('else:'), snapshot: snap(k, x, y, z), message: cost ? `c needs a 0 here, so ${cost} set bit${cost === 1 ? '' : 's'} must be cleared.` : 'c needs a 0 here and a and b already have 0, so no flip.' })
    }
    rows.push({ bit: k, a: x, b: y, c: z, cost })
  }
  frames.push({ phase: 'done', activeLine: L('return flips'), pythonLine: P('return flips'), snapshot: snap(null, null, null, null), message: `Total flips needed: ${flips}.` })
  return { input: { a, b, c }, result: flips, frames }
}

export const code = `minimum flips (a, b, c):
  flips = 0
  for each bit position k from 0 to 9:
    x, y, z = bit k of a, bit k of b, bit k of c
    if z == 1:
      if x == 0 and y == 0:
        flips += 1
    else:
      flips += x + y
  return flips`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def min_flips(a, b, c):
    flips = 0
    for k in range(10):
        x = (a >> k) & 1
        y = (b >> k) & 1
        z = (c >> k) & 1
        if z == 1:
            if x == 0 and y == 0:
                flips += 1
        else:
            flips += x + y
    return flips
`
