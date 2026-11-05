// LeetCode 1969: pair each value x with its complement (2^p - 1) - x. Each pair can be turned into (2^p - 2) and 1 ... the largest value stays, and 2^(p-1) - 1 pairs multiply to (2^p - 2) each.
const SOURCE = [
  "function minNonZeroProduct(p) {",
  "  const MOD = 1000000007n",
  "  const top = (1n << BigInt(p)) - 1n",
  "  const pairs = (1n << BigInt(p - 1)) - 1n",
  "  let result = top % MOD",
  "  result = result * powMod(top - 1n, pairs) % MOD",
  "  return Number(result)",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def min_non_zero_product(p):
    MOD = 10**9 + 7
    top = (1 << p) - 1
    pairs = (1 << (p - 1)) - 1
    result = top % MOD
    result = result * pow(top - 1, pairs, MOD) % MOD
    return result
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }
const MOD = 1000000007n

export const phases = [
  { id: 'pairs', label: 'Pair values', description: 'Pair each value with its bitwise complement.' },
  { id: 'power', label: 'Multiply pairs', description: 'Each pair multiplies to top - 1 after swaps.' },
  { id: 'done', label: 'Result', description: 'Minimum non-zero product modulo 1000000007.' },
]

export function parseInput(text) {
  const p = Number(String(text).trim())
  if (!Number.isInteger(p) || p < 1 || p > 5) throw new Error('Enter an integer p from 1 to 5 for the visualization.')
  return { p }
}

function powMod(base, exp) {
  let result = 1n
  let b = BigInt(base) % MOD
  let e = BigInt(exp)
  while (e > 0n) {
    if (e & 1n) result = (result * b) % MOD
    b = (b * b) % MOD
    e >>= 1n
  }
  return result
}

export function buildTrace({ p }) {
  const top = (1 << p) - 1
  const pairs = (1 << (p - 1)) - 1
  const frames = []
  for (let x = 1; x <= pairs; x++) {
    frames.push({ phase: 'pairs', activeLine: L('const pairs ='), pythonLine: P('pairs = (1'), message: `Pair ${x} with ${top - x}: they multiply to ${x * (top - x)} before swaps; after swaps the pair becomes ${top - 1} and 1.`, p, top, pairs, x, pairValue: top - 1, values: Array.from({ length: top }, (_, i) => i + 1) })
  }
  const power = powMod(top - 1, pairs)
  frames.push({ phase: 'power', activeLine: L('powMod(top - 1n'), pythonLine: P('pow(top'), message: `Raise ${top - 1} to the power ${pairs} modulo 1000000007: ${power}.`, p, top, pairs, x: null, pairValue: top - 1, values: Array.from({ length: top }, (_, i) => i + 1), power: Number(power) })
  const result = Number((BigInt(top) % MOD * power) % MOD)
  frames.push({ phase: 'done', activeLine: L('return Number(result)'), pythonLine: P('return result'), message: `${top} × ${power} modulo 1000000007 = ${result}.`, p, top, pairs, x: null, pairValue: top - 1, values: Array.from({ length: top }, (_, i) => i + 1), power: Number(power), result })
  return { input: { p }, result, frames }
}
