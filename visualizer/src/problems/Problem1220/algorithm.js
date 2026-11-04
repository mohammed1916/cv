// Teaching rule: group strings by their final vowel, then extend every length using only the vowels allowed before each one.

export const phases = [
  { id: 'start', label: 'Length 1', description: 'Each vowel alone is one string ending in that vowel.' },
  { id: 'inspect', label: 'Read row', description: 'Read the five counts for the current length.' },
  { id: 'update', label: 'Extend', description: 'Build the next row: each ending vowel gathers counts from the vowels allowed before it.' },
  { id: 'done', label: 'Total', description: 'Add the five counts for the full length, modulo 1000000007.' },
]

const MOD = 1000000007
const VOWELS = 'aeiou'
// Predecessors written in our own teaching notation: a may follow e, i or u; e may follow a or i; and so on.
const PREDECESSORS = { a: 'eiu', e: 'ai', i: 'eo', o: 'i', u: 'io' }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 3}.')
  if (!Number.isInteger(input.n) || input.n < 1 || input.n > 200) throw new Error('n must be an integer from 1 to 200.')
  return { n: input.n }
}

export function buildTrace({ n }) {
  const frames = []
  let counts = [1, 1, 1, 1, 1]
  const history = [[...counts]]
  frames.push({
    phase: 'start', activeLine: L('let counts = {'), pythonLine: P('counts = {v: 1'),
    message: 'Length 1: each vowel alone is one string, so every ending count is 1.',
    snapshot: { length: 1, counts: [...counts], history: history.map(r => [...r]) },
  })
  for (let length = 2; length <= n; length++) {
    frames.push({
      phase: 'inspect', activeLine: L('for (let step'), pythonLine: P('for _ in range'),
      message: `Read the row for length ${length - 1}: a=${counts[0]}, e=${counts[1]}, i=${counts[2]}, o=${counts[3]}, u=${counts[4]}.`,
      snapshot: { length: length - 1, counts: [...counts], history: history.map(r => [...r]) },
    })
    const next = VOWELS.split('').map(v => [...PREDECESSORS[v]].reduce((sum, p) => sum + counts[VOWELS.indexOf(p)], 0) % MOD)
    counts = next
    history.push([...counts])
    frames.push({
      phase: 'update', activeLine: L('next[v] ='), pythonLine: P('counts = {v: sum'),
      message: `Length ${length}: each ending vowel sums only the allowed predecessors from the previous row. New row: [${counts.join(', ')}].`,
      snapshot: { length, counts: [...counts], history: history.map(r => [...r]) },
    })
  }
  const result = counts.reduce((sum, c) => (sum + c) % MOD, 0)
  frames.push({
    phase: 'done', activeLine: L('return Object.values'), pythonLine: P('return sum'),
    message: `Add the five counts for length ${n}: ${result}.`,
    snapshot: { length: n, counts: [...counts], total: result, history: history.map(r => [...r]) },
  })
  return { input: { n }, result, frames }
}

const codeLines = [
  "function countVowelPermutation(n) {",
  "  const MOD = 1000000007",
  "  const before = { a: 'eiu', e: 'ai', i: 'eo', o: 'i', u: 'io' }",
  "  let counts = { a: 1, e: 1, i: 1, o: 1, u: 1 }",
  "  for (let step = 2; step <= n; step++) {",
  "    const next = {}",
  "    for (const v of 'aeiou') {",
  "      next[v] = [...before[v]].reduce((sum, p) => (sum + counts[p]) % MOD, 0)",
  "    }",
  "    counts = next",
  "  }",
  "  return Object.values(counts).reduce((sum, c) => (sum + c) % MOD, 0)",
  "}",
]
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

export const python = `MOD = 1_000_000_007
PREDECESSORS = {'a': 'eiu', 'e': 'ai', 'i': 'eo', 'o': 'i', 'u': 'io'}

def count_vowel_strings(n):
    counts = {v: 1 for v in 'aeiou'}
    for _ in range(n - 1):
        counts = {v: sum(counts[p] for p in PREDECESSORS[v]) % MOD for v in 'aeiou'}
    return sum(counts.values()) % MOD`

const pyLines = python.split('\n')
const L = s => {
  const i = codeLines.findIndex(t => t.includes(s))
  if (i < 0) throw new Error(`Missing code line: ${s}`)
  return i + 1
}
const P = s => {
  const i = pyLines.findIndex(t => t.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
