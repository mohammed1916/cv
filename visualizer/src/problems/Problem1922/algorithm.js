// LeetCode 1922: even positions take 5 digits, odd positions take 4 (2, 3, 5, 7). Powers use fast exponentiation.
const SOURCE = [
  "function countGoodNumbers(n) {",
  "  const MOD = 1000000007n",
  "  const power = (base, exp) => {",
  "    let result = 1n",
  "    while (exp > 0n) {",
  "      if (exp & 1n) result = (result * base) % MOD",
  "      base = (base * base) % MOD",
  "      exp >>= 1n",
  "    }",
  "    return result",
  "  }",
  "  const evenPart = power(5n, BigInt(Math.ceil(n / 2)))",
  "  const oddPart = power(4n, BigInt(Math.floor(n / 2)))",
  "  return Number((evenPart * oddPart) % MOD)",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def count_good_numbers(n):
    MOD = 10**9 + 7
    def power(base, exp):
        result = 1
        while exp > 0:
            if exp & 1:
                result = result * base % MOD
            base = base * base % MOD
            exp >>= 1
        return result
    return power(5, (n + 1) // 2) * power(4, n // 2) % MOD
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }
const MOD = 1000000007n

export const phases = [
  { id: 'even', label: 'Even positions', description: 'Raise 5 to the number of even positions.' },
  { id: 'odd', label: 'Odd positions', description: 'Raise 4 to the number of odd positions.' },
  { id: 'done', label: 'Result', description: 'Multiply the two powers.' },
]

export function parseInput(text) {
  const n = Number(String(text).trim())
  if (!Number.isInteger(n) || n < 1 || n > 40) throw new Error('Enter an integer from 1 to 40 for the visualization.')
  return { n }
}

function powerFrames(base, exp, label, phase, frames, lines) {
  let result = 1n
  let b = BigInt(base) % MOD
  let e = BigInt(exp)
  const bits = e.toString(2)
  frames.push({ phase, activeLine: L(label === 'even' ? 'evenPart' : 'oddPart'), pythonLine: P(label === 'even' ? 'power(5' : 'power(4'), message: `Compute ${base}^${exp} by repeated squaring; the exponent in binary is ${bits}.`, bits, exponent: exp, base: Number(b), result: Number(result), part: label })
  while (e > 0n) {
    const bit = e & 1n
    if (bit) result = (result * b) % MOD
    const step = { phase, activeLine: L('if (exp & 1n)'), pythonLine: P('if exp & 1'), message: bit ? `Low bit is 1: multiply the result by ${Number(b)}.` : 'Low bit is 0: the result stays the same.', bits, exponent: exp, base: Number(b), result: Number(result), part: label, remaining: Number(e) }
    frames.push(step)
    b = (b * b) % MOD
    e >>= 1n
  }
  lines.push(Number(result))
  return result
}

export function buildTrace({ n }) {
  const frames = []
  const evenCount = Math.ceil(n / 2)
  const oddCount = Math.floor(n / 2)
  const evenPart = powerFrames(5, evenCount, 'even', 'even', frames, [])
  const oddPart = powerFrames(4, oddCount, 'odd', 'odd', frames, [])
  const result = Number((evenPart * oddPart) % MOD)
  frames.push({ phase: 'done', activeLine: L('return Number((evenPart'), pythonLine: P('return power(5'), message: `${evenPart} x ${oddPart} modulo 1000000007 = ${result}.`, bits: '', exponent: null, base: null, result, part: 'done' })
  return { input: { n }, result, frames }
}
