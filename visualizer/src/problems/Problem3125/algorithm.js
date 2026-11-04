// LeetCode 3125: the largest x <= n whose AND over [x, n] is 0.
// The AND of a range keeps only the bits shared by every number in it. Any x that
// keeps n's top bit shares that bit with n, so the top bit of n must be cleared.
// Setting every lower bit makes x = 2^(width - 1) - 1, and that range's AND is 0.

const MAX_N = 1000000000

const CODE_TEXT = `function largestZeroAndStart(n) {
  const width = n.toString(2).length
  let x = 0
  for (let bit = width - 2; bit >= 0; bit--) {
    x |= 1 << bit
  }
  return x
}`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def largest_zero_and_start(n):
    width = n.bit_length()
    x = 0
    for i in range(width - 2, -1, -1):
        x |= 1 << i
    return x
`
const PY = s => {
  const index = python.split('\n').findIndex(c => c.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!Number.isInteger(value) || value < 1 || value > MAX_N) throw new Error(`Use one positive integer n up to ${MAX_N}.`)
  return { n: value }
}

export function buildTrace({ n }) {
  const width = n.toString(2).length
  const frames = []
  let x = 0
  frames.push({ phase: 'start', pythonLine: PY('width = n.bit_length()'), activeLine: L('const width'), width, n, x, bit: -1, nBit: null, action: 'start', message: `n = ${n} uses ${width} binary digit${width === 1 ? '' : 's'}. Its top bit (${width - 1}) must be cleared in x.` })
  for (let bit = width - 2; bit >= 0; bit--) {
    const nBit = (n >> bit) & 1
    frames.push({ phase: 'scan', pythonLine: PY('for i in range'), activeLine: L('for (let bit'), width, n, x, bit, nBit, action: 'check', message: `Bit ${bit} of n is ${nBit}. Lower bits of x are free to be 1.` })
    x |= 1 << bit
    frames.push({ phase: 'set', pythonLine: PY('x |= 1 << i'), activeLine: L('x |= 1 << bit'), width, n, x, bit, nBit, action: 'set', message: `Set bit ${bit} of x: x = ${x}.` })
  }
  if (width === 1) frames.push({ phase: 'scan', pythonLine: PY('x = 0'), activeLine: L('let x = 0'), width, n, x, bit: -1, nBit: null, action: 'check', message: `n = 1 has no lower bits, so x stays 0.` })
  frames.push({ phase: 'done', pythonLine: PY('return x'), activeLine: L('return x'), width, n, x, bit: -1, nBit: null, action: 'done', message: `Return ${x}: the AND of [${x}, ${n}] is 0.` })
  return { input: { n }, result: x, frames }
}
