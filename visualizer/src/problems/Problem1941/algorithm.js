// LeetCode 1941: the string is good when every letter that appears has the same frequency.
const SOURCE = [
  "function areOccurrencesEqual(s) {",
  "  const count = new Map()",
  "  for (const ch of s) count.set(ch, (count.get(ch) || 0) + 1)",
  "  const distinct = new Set(count.values())",
  "  return distinct.size === 1",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import Counter

def are_occurrences_equal(s):
    count = Counter(s)
    distinct = set(count.values())
    return len(distinct) == 1
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'count', label: 'Count letters', description: 'Count how often each letter appears.' },
  { id: 'compare', label: 'Compare', description: 'Check whether every count is the same.' },
  { id: 'done', label: 'Result', description: 'Answer the question.' },
]

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-z]{1,40}$/.test(s)) throw new Error('Enter 1 to 40 lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  const frames = []
  const count = new Map()
  for (const ch of s) {
    count.set(ch, (count.get(ch) || 0) + 1)
    frames.push({ phase: 'count', activeLine: L('for (const ch of s)'), pythonLine: P('count = Counter'), message: `${ch} now appears ${count.get(ch)} time(s).`, letter: ch, count: Object.fromEntries(count) })
  }
  const distinct = [...new Set(count.values())].sort((a, b) => a - b)
  frames.push({ phase: 'compare', activeLine: L('const distinct ='), pythonLine: P('distinct = set'), message: `Distinct frequencies: ${distinct.join(', ')}.`, letter: null, count: Object.fromEntries(count), distinct })
  const result = distinct.length === 1
  frames.push({ phase: 'done', activeLine: L('return distinct.size === 1'), pythonLine: P('return len'), message: result ? 'Only one frequency appears, so the string is good.' : 'More than one frequency appears.', letter: null, count: Object.fromEntries(count), distinct, result })
  return { input: { s }, result, frames }
}
