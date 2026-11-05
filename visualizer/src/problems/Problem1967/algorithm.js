// LeetCode 1967: a pattern counts when it appears as a contiguous substring of word.
const SOURCE = [
  "function numOfStrings(patterns, word) {",
  "  let found = 0",
  "  for (const pattern of patterns) {",
  "    if (word.includes(pattern)) found++",
  "  }",
  "  return found",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def num_of_strings(patterns, word):
    found = 0
    for pattern in patterns:
        if pattern in word:
            found += 1
    return found
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'check', label: 'Check patterns', description: 'Search word for each pattern.' },
  { id: 'done', label: 'Result', description: 'Count the patterns that were found.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"patterns":["ab","cd"],"word":"xaby"}.') }
  const { patterns, word } = input || {}
  if (typeof word !== 'string' || !/^[a-z]{1,30}$/.test(word)) throw new Error('word is 1 to 30 lowercase letters.')
  if (!Array.isArray(patterns) || patterns.length < 1 || patterns.length > 8 || !patterns.every(p => typeof p === 'string' && /^[a-z]{1,10}$/.test(p))) throw new Error('patterns holds 1 to 8 lowercase strings.')
  return { patterns, word }
}

export function buildTrace({ patterns, word }) {
  const frames = []
  const checks = []
  let found = 0
  for (const pattern of patterns) {
    const hit = word.includes(pattern)
    if (hit) found++
    checks.push({ pattern, hit })
    frames.push({ phase: 'check', activeLine: L('for (const pattern of patterns)'), pythonLine: P('for pattern in'), message: hit ? `"${pattern}" appears in "${word}".` : `"${pattern}" does not appear in "${word}".`, checks: [...checks], found, word })
  }
  frames.push({ phase: 'done', activeLine: L('return found'), pythonLine: P('return found'), message: `${found} pattern(s) appear.`, checks: [...checks], found, word })
  return { input: { patterns, word }, result: found, frames }
}
