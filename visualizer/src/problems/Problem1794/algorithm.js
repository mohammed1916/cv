export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and t.')
  const { s, t } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 10 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 10 lowercase letters.')
  if (typeof t !== 'string' || t.length < 1 || t.length > 10 || !/^[a-z]+$/.test(t)) throw new Error('t has 1 to 10 lowercase letters.')
  return { s, t }
}

export const code = `count the start pairs with the smallest index gap that match
  set best to nothing and count to 0
  for each start i in s
    for each start j in t
      if s at i equals t at j then it is a length-one match
        gap = absolute value of i minus j
        if best is nothing or gap is smaller than best then best = gap and count = 1
        else if gap equals best then add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const line = code.findIndex(c => c.text.includes(s))
  if (line < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return line + 1
}

export const python = `def count_min_gap_pairs(s, t):
    best = None
    count = 0
    for i in range(len(s)):
        for j in range(len(t)):
            if s[i] == t[j]:
                gap = abs(i - j)
                if best is None or gap < best:
                    best = gap
                    count = 1
                elif gap == best:
                    count += 1
    return count
`
const P = s => {
  const line = python.split('\n').findIndex(p => p.includes(s))
  if (line < 0) throw new Error(`Missing python line: ${s}`)
  return line + 1
}

export const phases = [
  { id: 'setup', label: 'Setup', description: 'Start with no best gap and a count of zero.' },
  { id: 'scan', label: 'Scan', description: 'Test the pair of starts (i, j).' },
  { id: 'match', label: 'Match', description: 'The letters agree, so (i, j) is a witness.' },
  { id: 'reset', label: 'New best', description: 'A smaller gap replaces the best.' },
  { id: 'tie', label: 'Tie', description: 'This pair ties the best gap.' },
  { id: 'done', label: 'Result', description: 'Report the number of pairs at the best gap.' },
]

export function buildTrace({ s, t }) {
  const frames = []
  let best = null
  let count = 0
  frames.push({ pythonLine: P('best = None'), phase: 'setup', activeLine: L('set best to nothing'), i: -1, j: -1, best, count, outcome: null, message: 'No witness yet, so there is no best gap.' })
  for (let i = 0; i < s.length; i++) {
    for (let j = 0; j < t.length; j++) {
      frames.push({ pythonLine: P('if s[i] == t[j]'), phase: 'scan', activeLine: L('for each start j'), i, j, best, count, outcome: 'scan', message: `Test s[${i}] = ${s[i]} against t[${j}] = ${t[j]}.` })
      if (s[i] !== t[j]) continue
      const gap = Math.abs(i - j)
      if (best === null || gap < best) {
        best = gap
        count = 1
        frames.push({ pythonLine: P('best = gap'), phase: 'reset', activeLine: L('then best = gap'), i, j, best, count, outcome: 'reset', message: `Letters match with gap ${gap}, a new best; count is 1.` })
      } else if (gap === best) {
        count += 1
        frames.push({ pythonLine: P('count += 1'), phase: 'tie', activeLine: L('add 1 to count'), i, j, best, count, outcome: 'tie', message: `Gap ${gap} ties the best; count is ${count}.` })
      } else {
        frames.push({ pythonLine: P('if best is None'), phase: 'match', activeLine: L('if best is nothing'), i, j, best, count, outcome: 'longer', message: `Letters match with gap ${gap}, which is larger than the best ${best}.` })
      }
    }
  }
  frames.push({ pythonLine: P('return count'), phase: 'done', activeLine: L('return count'), i: -1, j: -1, best, count, outcome: null, message: best === null ? 'No letter occurs in both strings, so the count is 0.' : `${count} pair${count === 1 ? '' : 's'} at the smallest gap ${best}.` })
  return { input: { s, t }, result: count, frames }
}
