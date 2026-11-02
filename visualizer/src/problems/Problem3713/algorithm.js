const LOWER = /^[a-z]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !LOWER.test(s)) throw new Error('s has 1 to 20 lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  const frames = []
  let best = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('best = 0'), start: -1, at: -1, best, message: 'Start with no balanced substring found.' })
  for (let i = 0; i < s.length; i++) {
    const counts = new Map()
    frames.push({ pythonLine: 5, phase: 'window', activeLine: L('counts'), start: i, at: -1, best, message: `Begin substrings at index ${i}.` })
    for (let j = i; j < s.length; j++) {
      counts.set(s[j], (counts.get(s[j]) || 0) + 1)
      frames.push({ pythonLine: 7, phase: 'extend', activeLine: L('count the letter'), start: i, at: j, best, message: `Include ${s[j]}; counts are ${[...counts].map(([c, n]) => `${c}:${n}`).join(' ')}.` })
      const values = new Set(counts.values())
      const balanced = values.size === 1
      frames.push({ pythonLine: 8, phase: 'check', activeLine: L('if every count'), start: i, at: j, ok: balanced, best, message: balanced ? `All counts equal ${[...values][0]}.` : 'Counts differ, so s[i..j] is not balanced.' })
      if (balanced && j - i + 1 > best) {
        best = j - i + 1
        frames.push({ pythonLine: 9, phase: 'update', activeLine: L('best = j'), start: i, at: j, ok: true, best, message: `Length ${best} is the new best.` })
      }
    }
  }
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return best'), start: -1, at: -1, ok: best > 0, best, message: `The longest balanced substring has length ${best}.` })
  return { input: { s }, result: best, frames }
}

export const code = `longest balanced substring length
  best = 0
  for each start index i
    counts = empty map
    for each end index j from i to the end
      count s at j in counts
      if every count in counts is equal then
        best = max(best, j - i + 1)
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_balanced_substring(s):
    best = 0
    n = len(s)
    for i in range(n):
        counts = {}
        for j in range(i, n):
            counts[s[j]] = counts.get(s[j], 0) + 1
            if len(set(counts.values())) == 1 and j - i + 1 > best:
                best = j - i + 1
    return best
`
