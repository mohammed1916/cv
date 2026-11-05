const PHASES = [
  { id: 'bits', label: 'Bits', description: 'Read the binary digits of n from the most significant end.' },
  { id: 'double', label: 'Double', description: 'Double the index: derive F(2k) and F(2k+1) from F(k) and F(k+1).' },
  { id: 'step', label: 'Step', description: 'Add one when the bit is set, moving the index up by one.' },
  { id: 'done', label: 'Answer', description: 'Return twice F(n) modulo 1000000007.' },
]

export const phases = PHASES

// A good string has every maximal run of odd length, so the count is 2 * F(n), where F(n) counts
// the compositions of n into odd parts. Fast doubling computes F(n) from the bits of n.
const CODE_LINES = [
  'const MOD = 1000000007n',
  'function countGoodStrings(n) {',
  '  let a = 0n, b = 1n',
  "  for (const bit of n.toString(2)) {",
  '    const c = (a * (((2n * b - a) % MOD) + MOD)) % MOD',
  '    const d = (a * a + b * b) % MOD',
  "    if (bit === '1') { a = d; b = (c + d) % MOD }",
  '    else { a = c; b = d }',
  '  }',
  '  return (2n * a) % MOD',
  '}',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `MOD = 1000000007

def count_good(n):
    a, b = 0, 1
    for bit in bin(n)[2:]:
        c = (a * ((2 * b - a) % MOD)) % MOD
        d = (a * a + b * b) % MOD
        if bit == '1':
            a, b = d, (c + d) % MOD
        else:
            a, b = c, d
    return (2 * a) % MOD
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

const MOD = 1000000007n

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 1000000000000000) throw new Error('n is an integer from 1 to 10^15.')
  return { n }
}

export function buildTrace({ n }) {
  const bits = n.toString(2)
  const frames = []
  let a = 0n
  let b = 1n
  let read = 0
  const show = (phase, line, py, bit, c, d, message) => frames.push({
    pythonLine: P(py), phase, activeLine: L(line), bits, bit, readCount: read, k: null, a: Number(a), b: Number(b), c: c === null ? null : Number(c), d: d === null ? null : Number(d), message,
  })
  show('bits', 'let a = 0n', 'a, b = 0, 1', null, null, null, `n = ${n} has ${bits.length} binary digit${bits.length === 1 ? '' : 's'}: ${bits}.`)
  let k = 0n
  for (const bit of bits) {
    read++
    const c = (a * (((2n * b - a) % MOD) + MOD)) % MOD
    const d = (a * a + b * b) % MOD
    show('double', 'const c = (a *', 'c = (a * ((2 * b - a)', bit, c, d, `Index ${k} to ${2n * k}${bit === '1' ? ' plus 1' : ''}: F(${2n * k}) = ${c}, F(${2n * k + 1n}) = ${d}.`)
    if (bit === '1') {
      a = d
      b = (c + d) % MOD
      k = 2n * k + 1n
      show('step', "if (bit === '1')", "if bit == '1'", bit, c, d, `Bit is 1: move to index ${k}.`)
    } else {
      a = c
      b = d
      k = 2n * k
      show('step', "else { a = c; b = d }", "if bit == '1'", bit, c, d, `Bit is 0: stay at index ${k}.`)
    }
  }
  const answer = (2n * a) % MOD
  show('done', 'return (2n * a)', 'return (2 * a) % MOD', null, null, null, `F(${n}) mod p is ${a}; the count is ${answer}.`)
  return { input: { n }, result: Number(answer), frames }
}
