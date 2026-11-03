export const phases = [
  { id: 'start', label: 'Read strings', description: 'A pair is an equal-length substring of s and a substring of t that differ at exactly one position.' },
  { id: 'align', label: 'Choose starts', description: 'Fix a start i in s and j in t. Each extension adds one aligned character to both.' },
  { id: 'extend', label: 'Extend and count', description: 'Count the pair when exactly one mismatch has appeared. Stop after the second mismatch.' },
  { id: 'done', label: 'Total', description: 'The total is the number of qualifying pairs.' },
]

export function parseInput(text) {
  const pair = JSON.parse(text)
  if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(s => typeof s === 'string' && /^[a-z]{1,8}$/.test(s))) {
    throw new Error('Enter a JSON array of two strings, each 1–8 lowercase letters.')
  }
  return { s: pair[0], t: pair[1] }
}

export function buildTrace({ s, t }) {
  const frames = []
  let total = 0
  frames.push({
    phase: 'start', activeLine: 2,
    message: `Compare s = "${s}" with t = "${t}". Count pairs of equal-length substrings that differ in exactly one position.`,
    snapshot: { s, t, i: null, j: null, length: 0, mismatches: 0, total: 0 },
  })
  for (let i = 0; i < s.length; i++) {
    for (let j = 0; j < t.length; j++) {
      frames.push({
        phase: 'align', activeLine: 5,
        message: `Start s at ${i} and t at ${j}. Length 1 is the first pair from these starts.`,
        snapshot: { s, t, i, j, length: 0, mismatches: 0, total },
      })
      let mismatches = 0
      for (let k = 0; i + k < s.length && j + k < t.length; k++) {
        if (s[i + k] !== t[j + k]) mismatches++
        if (mismatches > 1) {
          frames.push({
            phase: 'extend', activeLine: 8,
            message: `Length ${k + 1} now has ${mismatches} mismatches, and so does every longer pair from these starts. Stop extending.`,
            snapshot: { s, t, i, j, length: k + 1, mismatches, total },
          })
          break
        }
        const counted = mismatches === 1
        if (counted) total++
        frames.push({
          phase: 'extend', activeLine: counted ? 9 : 7,
          message: counted
            ? `Length ${k + 1} has exactly one mismatch, so it counts. Total is now ${total}.`
            : `Length ${k + 1} has no mismatch yet. Extend to the next character.`,
          snapshot: { s, t, i, j, length: k + 1, mismatches, total },
        })
      }
    }
  }
  frames.push({
    phase: 'done', activeLine: 10,
    message: `Return ${total}: the number of pairs that differ in exactly one character.`,
    snapshot: { s, t, i: null, j: null, length: 0, mismatches: 0, total },
  })
  return { input: { s, t }, result: total, frames }
}

const LINES = [
  'def count_one_mismatch(s, t):',
  '    total = 0',
  '    for i in range(len(s)):',
  '        for j in range(len(t)):',
  '            mismatches = 0',
  '            for k in range(min(len(s) - i, len(t) - j)):',
  '                mismatches += s[i + k] != t[j + k]',
  '                if mismatches > 1: break',
  '                if mismatches == 1: total += 1',
  '    return total',
]
export const code = LINES.map((text, index) => ({ line: index + 1, text }))
export const python = LINES.join('\n')
export const pythonLineMap = Object.fromEntries(LINES.map((_, i) => [i + 1, i + 1]))
