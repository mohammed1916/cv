export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 's') throw new Error('Use a JSON object with exactly one key, s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 40) throw new Error('s must be a string of 1 to 40 characters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s may contain only lowercase letters a to z.')
  return { s }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function lastSubstring(s) {', 'def last_substring(s):'],
  ['  const n = s.length', '    n = len(s)'],
  ['  let i = 0, j = 1, k = 0', '    i, j, k = 0, 1, 0'],
  ['  while (j + k < n) {', '    while j + k < n:'],
  ['    if (s[i + k] === s[j + k]) {', '        if s[i + k] == s[j + k]:'],
  ['      k++', '            k += 1'],
  ['    } else {', '        else:'],
  ['      if (s[i + k] < s[j + k]) {', '            if s[i + k] < s[j + k]:'],
  ['        i = Math.max(i + k + 1, j)', '                i = max(i + k + 1, j)'],
  ['        j = i + 1', '                j = i + 1'],
  ['      } else {', '            else:'],
  ['        j = j + k + 1', '                j = j + k + 1'],
  ['      }', ''],
  ['      k = 0', '            k = 0'],
  ['    }', ''],
  ['  }', ''],
  ['  return s.slice(i)', '    return s[i:]'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ s }) {
  const n = s.length
  let i = 0
  let j = 1
  let k = 0
  const frames = [{ phase: 'start', pythonLine: P('i, j, k = 0'), activeLine: L('let i = 0'), i, j, k, message: 'Compare the suffix at 0 with the suffix at 1.' }]
  while (j + k < n) {
    if (s[i + k] === s[j + k]) {
      k++
      frames.push({ phase: 'match', pythonLine: P('k += 1'), activeLine: L('k++'), i, j, k, message: `Both suffixes read ${s[i + k - 1]} at offset ${k - 1}. Keep comparing.` })
      continue
    }
    if (s[i + k] < s[j + k]) {
      const next = Math.max(i + k + 1, j)
      frames.push({ phase: 'move-i', pythonLine: P('i = max(i + k + 1'), activeLine: L('i = Math.max'), i, j, k, message: `At offset ${k}, ${s[j + k]} beats ${s[i + k]}, so no start from ${i} through ${i + k} can win. Move i to ${next}.` })
      i = next
      j = i + 1
    } else {
      frames.push({ phase: 'move-j', pythonLine: P('j = j + k + 1'), activeLine: L('j = j + k + 1'), i, j, k, message: `At offset ${k}, ${s[i + k]} beats ${s[j + k]}, so the start ${j} through ${j + k} cannot win. Move j to ${j + k + 1}.` })
      j = j + k + 1
    }
    k = 0
  }
  const result = s.slice(i)
  frames.push({ phase: 'done', pythonLine: P('return s[i:]'), activeLine: L('return s.slice(i)'), i, j, k: 0, message: `The largest substring starts at ${i}: ${result}.` })
  return { input: { s }, result, frames }
}
