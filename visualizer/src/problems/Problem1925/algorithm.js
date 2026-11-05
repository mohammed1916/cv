// LeetCode 1925: count ordered pairs (a, b) whose squares sum to a square c * c with c <= n.
const SOURCE = [
  "function countSquareTriples(n) {",
  "  let count = 0",
  "  for (let a = 1; a <= n; a++) {",
  "    for (let b = 1; b <= n; b++) {",
  "      const c2 = a * a + b * b",
  "      const c = Math.floor(Math.sqrt(c2))",
  "      if (c <= n && c * c === c2) count++",
  "    }",
  "  }",
  "  return count",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `from math import isqrt

def count_square_triples(n):
    count = 0
    for a in range(1, n + 1):
        for b in range(1, n + 1):
            c2 = a * a + b * b
            c = isqrt(c2)
            if c <= n and c * c == c2:
                count += 1
    return count
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'scan', label: 'Scan pairs', description: 'Test each pair (a, b) for an integer hypotenuse no larger than n.' },
  { id: 'done', label: 'Result', description: 'Count the pairs that succeeded.' },
]

export function parseInput(text) {
  const n = Number(String(text).trim())
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('Enter an integer from 1 to 12 for the visualization.')
  return { n }
}

export function buildTrace({ n }) {
  const frames = []
  const hits = []
  let count = 0
  for (let a = 1; a <= n; a++) {
    for (let b = 1; b <= n; b++) {
      const c2 = a * a + b * b
      const c = Math.floor(Math.sqrt(c2))
      const ok = c <= n && c * c === c2
      if (ok) { count++; hits.push([a, b, c]) }
      frames.push({ phase: 'scan', activeLine: L('const c2 ='), pythonLine: P('c2 = a'), message: ok ? `(${a}, ${b}, ${c}) is a square triple.` : `${a}² + ${b}² = ${c2} is not a square no larger than n.`, a, b, ok, count, hits: [...hits] })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), message: `${count} ordered pairs found.`, a: -1, b: -1, ok: null, count, hits: [...hits] })
  return { input: { n }, result: count, frames }
}
