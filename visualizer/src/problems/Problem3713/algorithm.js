const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

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
  frames.push({ pythonLine: P('best = 0'), phase: 'start', activeLine: L('let best'), start: -1, at: -1, best, message: 'Start with no balanced substring found.' })
  for (let i = 0; i < s.length; i++) {
    const counts = new Map()
    frames.push({ pythonLine: P('counts = {}'), phase: 'window', activeLine: L('const counts'), start: i, at: -1, best, message: `Begin substrings at index ${i}.` })
    for (let j = i; j < s.length; j++) {
      counts.set(s[j], (counts.get(s[j]) || 0) + 1)
      frames.push({ pythonLine: P('counts[s[j]]'), phase: 'extend', activeLine: L('counts.set(s[j]'), start: i, at: j, best, message: `Include ${s[j]}; counts are ${[...counts].map(([c, n]) => `${c}:${n}`).join(' ')}.` })
      const values = new Set(counts.values())
      const balanced = values.size === 1
      frames.push({ pythonLine: P('if len(set'), phase: 'check', activeLine: L('new Set(counts'), start: i, at: j, ok: balanced, best, message: balanced ? `All counts equal ${[...values][0]}.` : 'Counts differ, so s[i..j] is not balanced.' })
      if (balanced && j - i + 1 > best) {
        best = j - i + 1
        frames.push({ pythonLine: P('best = j - i'), phase: 'update', activeLine: L('j - i + 1 > best'), start: i, at: j, ok: true, best, message: `Length ${best} is the new best.` })
      }
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), start: -1, at: -1, ok: best > 0, best, message: `The longest balanced substring has length ${best}.` })
  return { input: { s }, result: best, frames }
}

export const code = `function longestBalancedSubstring(s) {
  let best = 0
  for (let i = 0; i < s.length; i++) {
    const counts = new Map()
    for (let j = i; j < s.length; j++) {
      counts.set(s[j], (counts.get(s[j]) || 0) + 1)
      if (new Set(counts.values()).size === 1 && j - i + 1 > best) best = j - i + 1
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}

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
