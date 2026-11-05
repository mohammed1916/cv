// LeetCode 1952: exactly three divisors happens only for the square of a prime.
const SOURCE = [
  "function isThree(n) {",
  "  let divisors = 0",
  "  for (let d = 1; d <= n; d++) {",
  "    if (n % d === 0) divisors++",
  "  }",
  "  return divisors === 3",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def is_three(n):
    divisors = 0
    for d in range(1, n + 1):
        if n % d == 0:
            divisors += 1
    return divisors == 3
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'scan', label: 'Try divisors', description: 'Test each candidate d from 1 to n.' },
  { id: 'done', label: 'Result', description: 'Compare the divisor count with 3.' },
]

export function parseInput(text) {
  const n = Number(String(text).trim())
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('Enter an integer from 1 to 100 for the visualization.')
  return { n }
}

export function buildTrace({ n }) {
  const frames = []
  const found = []
  for (let d = 1; d <= n; d++) {
    const hit = n % d === 0
    if (hit) found.push(d)
    frames.push({ phase: 'scan', activeLine: L('for (let d = 1'), pythonLine: P('for d in'), message: hit ? `${d} divides ${n}.` : `${d} does not divide ${n}.`, d, found: [...found], n })
  }
  const result = found.length === 3
  frames.push({ phase: 'done', activeLine: L('return divisors'), pythonLine: P('return divisors'), message: `${n} has ${found.length} divisor(s): ${found.join(', ')}.`, d: -1, found: [...found], n, result })
  return { input: { n }, result, frames }
}
