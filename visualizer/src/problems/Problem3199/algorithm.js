// LeetCode 3199: Count Triplets with Even XOR Set Bits I.
// Pick one value from each array; a triplet counts when the XOR of the three values has an even number of set bits.
// This version tries every triple, so it is the direct reading of the rule.

const CODE_TEXT = `function countEvenTriples(a, b, c) {
  let count = 0
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      for (let k = 0; k < c.length; k++) {
        const value = a[i] ^ b[j] ^ c[k]
        let ones = 0
        for (let v = value; v > 0; v &= v - 1) ones++
        if (ones % 2 === 0) count++
      }
    }
  }
  return count
}`.split('\n')
export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

export const python = `def count_even_triples(a, b, c):
    count = 0
    for i in range(len(a)):
        for j in range(len(b)):
            for k in range(len(c)):
                value = a[i] ^ b[j] ^ c[k]
                if bin(value).count("1") % 2 == 0:
                    count += 1
    return count
`

const PY_LINES = python.split('\n')
const L = s => { const n = code.findIndex(c => c.text.includes(s)) + 1; if (!n) throw new Error(`Missing pseudocode line: ${s}`); return n }
const P = s => { const n = PY_LINES.findIndex(l => l.includes(s)) + 1; if (!n) throw new Error(`Missing Python line: ${s}`); return n }

export const phases = [
  { id: 'start', label: 'Arrays', description: 'Start with no counted triplets.' },
  { id: 'triple', label: 'Triple', description: 'Choose one value from each array and XOR them.' },
  { id: 'even', label: 'Even', description: 'The XOR has an even number of set bits, so it counts.' },
  { id: 'odd', label: 'Odd', description: 'The XOR has an odd number of set bits, so it is skipped.' },
  { id: 'done', label: 'Result', description: 'Report the number of counted triplets.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with arrays a, b and c.')
  const out = {}
  for (const key of ['a', 'b', 'c']) {
    const arr = input[key]
    if (!Array.isArray(arr) || arr.length < 1 || arr.length > 8) throw new Error(`${key} has 1 to 8 values.`)
    if (!arr.every(v => Number.isInteger(v) && v >= 0 && v <= 255)) throw new Error(`${key} holds integers from 0 to 255.`)
    out[key] = arr.slice()
  }
  return out
}

const bitCount = value => { let n = 0; for (let v = value; v > 0; v >>= 1) n += v & 1; return n }

export function buildTrace({ a, b, c }) {
  const frames = []
  let count = 0
  frames.push({ a, b, c, phase: 'start', activeLine: L('function countEvenTriples'), pythonLine: P('def count_even'), i: -1, j: -1, k: -1, value: null, bits: null, count, message: `Arrays of ${a.length}, ${b.length} and ${c.length} values.` })
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      for (let k = 0; k < c.length; k++) {
        const value = a[i] ^ b[j] ^ c[k]
        const bits = bitCount(value)
        const even = bits % 2 === 0
        if (even) count++
        const common = { a, b, c, i, j, k, value, bits, count }
        frames.push({ ...common, phase: 'triple', activeLine: L('const value = a[i]'), pythonLine: P('value = a[i]'), message: `${a[i]} XOR ${b[j]} XOR ${c[k]} = ${value}, with ${bits} set bit${bits === 1 ? '' : 's'}.` })
        frames.push({ ...common, phase: even ? 'even' : 'odd', activeLine: L('if (ones % 2 === 0)'), pythonLine: P('if bin(value)'), message: even ? `${bits} set bits is even: counted, total ${count}.` : `${bits} set bits is odd: not counted.` })
      }
    }
  }
  frames.push({ a, b, c, phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), i: -1, j: -1, k: -1, value: null, bits: null, count, message: `${count} triplet${count === 1 ? '' : 's'} have an even XOR set-bit count.` })
  return { input: { a, b, c }, result: count, frames }
}
