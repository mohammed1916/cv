// LeetCode 3125: the largest x below n whose bits never overlap n's set bits.
// x may only use positions where n holds a 0. Its top bit cannot reach n's top bit,
// so setting every zero position of n (within its width) gives the largest such x.

const MAX_N = 1000000000

const CODE_TEXT = `FUNCTION largestPartner(n)
    width ← number of binary digits of n
    x ← 0
    FOR bit from width - 1 DOWN to 0
        IF bit of n is 0 THEN set that bit of x to 1
    RETURN x`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def largest_partner(n):
    width = n.bit_length()
    x = 0
    for i in range(width - 1, -1, -1):
        if not (n >> i) & 1:
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
  frames.push({ phase: 'start', pythonLine: PY('width = n.bit_length()'), activeLine: L('number of binary digits'), width, n, x, bit: -1, nBit: null, action: 'start', message: `n = ${n} uses ${width} binary digit${width === 1 ? '' : 's'}; x starts at 0.` })
  for (let bit = width - 1; bit >= 0; bit--) {
    const nBit = (n >> bit) & 1
    frames.push({ phase: 'scan', pythonLine: PY('for i in range'), activeLine: L('FOR bit from'), width, n, x, bit, nBit, action: 'check', message: `Bit ${bit} of n is ${nBit}.` })
    if (nBit === 0) {
      x |= 1 << bit
      frames.push({ phase: 'set', pythonLine: PY('x |= 1 << i'), activeLine: L('set that bit of x'), width, n, x, bit, nBit, action: 'set', message: `Bit ${bit} is free in n, so x takes it: x = ${x}.` })
    } else {
      frames.push({ phase: 'skip', pythonLine: PY('if not (n >> i) & 1'), activeLine: L('IF bit of n is 0'), width, n, x, bit, nBit, action: 'skip', message: `Bit ${bit} is set in n, so x keeps it at 0.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: PY('return x'), activeLine: L('RETURN x'), width, n, x, bit: -1, nBit: null, action: 'done', message: `${x} is the largest value below ${n} that shares no set bit with it.` })
  return { input: { n }, result: x, frames }
}
