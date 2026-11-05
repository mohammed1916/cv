export const phases = [
  { id: 'start', label: 'Start', description: 'Compare a, b and c one bit position at a time, starting from the lowest bit.' },
  { id: 'both', label: 'c bit is 0, a and b are 1', description: 'When c needs 0, every 1 bit in a and in b must be flipped to 0.' },
  { id: 'one', label: 'c bit is 0, one of a or b is 1', description: 'Flip that single 1 bit to 0.' },
  { id: 'missing', label: 'c bit is 1, a and b are 0', description: 'When c needs 1 but neither a nor b has it, one flip creates it.' },
  { id: 'match', label: 'Bits already match', description: 'No flip is needed at this bit position.' },
  { id: 'done', label: 'Complete', description: 'Return the total number of flips.' },
]

export const examples = [
  { label: 'Classic example', input: '{"a":2,"b":6,"c":5}' },
  { label: 'Equal already', input: '{"a":4,"b":2,"c":7}' },
  { label: 'Both ones need flips', input: '{"a":1,"b":2,"c":3}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || ![data.a, data.b, data.c].every(Number.isInteger)) throw new Error('Use an object with integers a, b and c, such as {"a":2,"b":6,"c":5}.')
  for (const [name, v] of [['a', data.a], ['b', data.b], ['c', data.c]]) {
    if (v < 1 || v > 1000000000) throw new Error(`${name} must be from 1 to 1000000000.`)
  }
  return { a: data.a, b: data.b, c: data.c }
}

export function buildTrace({ a, b, c }) {
  let flips = 0
  const rows = []
  const snap = (bit, extra = {}) => ({ bit, rows: [...rows], flips, ...extra })
  const frames = [{ phase: 'start', activeLine: L('let flips = 0'), pythonLine: P('flips = 0'), snapshot: snap(null),
    message: `Compare the bits of ${a}, ${b} and ${c} from the lowest position upward.` }]
  const bits = Math.max(a, b, c).toString(2).length
  for (let bit = 0; bit < bits; bit++) {
    const x = (a >> bit) & 1, y = (b >> bit) & 1, z = (c >> bit) & 1
    let phase, message, add = 0, line, py
    if (z === 0 && x === 1 && y === 1) { phase = 'both'; add = 2; line = L('flips += 2'); py = P('flips += 2'); message = `Bit ${bit}: a and b are both 1 but c is 0, so flip both (2 flips).` }
    else if (z === 0 && (x === 1 || y === 1)) { phase = 'one'; add = 1; line = L('flips += 1'); py = P('flips += 1'); message = `Bit ${bit}: c is 0 and one of a or b is 1, so flip that bit (1 flip).` }
    else if (z === 1 && x === 0 && y === 0) { phase = 'missing'; add = 1; line = L('flips += 1'); py = P('flips += 1'); message = `Bit ${bit}: c is 1 but a and b are 0, so flip one bit (1 flip).` }
    else { phase = 'match'; line = L('if (z === 0'); py = P('if z == 0'); message = `Bit ${bit}: the bits already give c's value, so no flip.` }
    flips += add
    rows.push({ bit, a: x, b: y, c: z, flips: add })
    frames.push({ phase, activeLine: line, pythonLine: py, snapshot: snap(bit, { x, y, z, add }), message })
  }
  frames.push({ phase: 'done', activeLine: L('return flips'), pythonLine: P('return flips'), snapshot: snap(null),
    message: `Return ${flips}.`, result: flips })
  return { input: { a, b, c }, result: flips, frames }
}

export const code = `function minFlips(a, b, c) {
  let flips = 0
  for (let bit = 0; bit < 31; bit++) {
    const x = (a >> bit) & 1, y = (b >> bit) & 1, z = (c >> bit) & 1
    if (z === 0) {
      flips += x + y
    } else if (x === 0 && y === 0) {
      flips += 1
    }
  }
  return flips
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_flips(a, b, c):
    flips = 0
    for bit in range(31):
        x = (a >> bit) & 1
        y = (b >> bit) & 1
        z = (c >> bit) & 1
        if z == 0:
            flips += x + y
        elif x == 0 and y == 0:
            flips += 1
    return flips
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
