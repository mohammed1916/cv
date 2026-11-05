// LeetCode 4043: Count Rotations With Exactly K Equal Adjacent Pairs.
// For each prefix length p from 0 to n - 1, move that prefix to the end. Count the positions i (0 <= i < n - 1)
// of the rotated string where t[i] equals t[i + 1]; the first and last characters are never a pair.
// Rotations are counted by position, even when two rotations give the same text.
// The note's bounds (lowercase letters, length 2..100, 0 <= k <= n - 1) are checked on parse;
// the visualization caps the string at 12 characters, since every rotation is drawn as a row.

const MAX_VISUAL_LENGTH = 12

const PYTHON_SOURCE = `def count_rotations(s, k):
    n = len(s)
    answer = 0
    for p in range(n):
        t = s[p:] + s[:p]
        pairs = 0
        for i in range(n - 1):
            if t[i] == t[i + 1]:
                pairs += 1
        if pairs == k:
            answer += 1
    return answer

if __name__ == "__main__":
    import sys, json
    data = json.loads(sys.stdin.read())
    print(count_rotations(data["s"], data["k"]))
`

export const code = `function countRotations(s, k) {
  const n = s.length
  let answer = 0
  for (let p = 0; p < n; p++) {
    const t = s.slice(p) + s.slice(0, p)
    let pairs = 0
    for (let i = 0; i < n - 1; i++) {
      if (t[i] === t[i + 1]) pairs++
    }
    if (pairs === k) answer++
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const PY = PYTHON_SOURCE.split('\n')
const P = s => {
  const index = PY.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 2 || s.length > 100 || !/^[a-z]+$/.test(s)) throw new Error('s is 2 to 100 lowercase letters.')
  if (!Number.isInteger(k) || k < 0 || k > s.length - 1) throw new Error('k is an integer from 0 to len(s) - 1.')
  return { s, k }
}

export function buildTrace({ s, k }) {
  if (s.length > MAX_VISUAL_LENGTH) throw new Error(`The visualization caps the string at ${MAX_VISUAL_LENGTH} characters.`)
  const n = s.length
  const frames = []
  const rows = []
  let answer = 0
  frames.push({ phase: 'setup', pythonLine: P('n = len(s)'), activeLine: L('const n = s.length'), p: -1, t: null, pairs: null, i: null, rows: [], answer, k,
    message: `Rotate a ${n}-character string by each prefix length 0 to ${n - 1}; keep rotations with exactly ${k} equal neighbours.` })
  for (let p = 0; p < n; p += 1) {
    const t = s.slice(p) + s.slice(0, p)
    frames.push({ phase: 'rotate', pythonLine: P('t = s[p:] + s[:p]'), activeLine: L('const t = s.slice(p)'), p, t, pairs: 0, i: null, rows: [...rows], answer, k,
      message: `Prefix length ${p} moves to the end: "${t}".` })
    let pairs = 0
    for (let i = 0; i < n - 1; i += 1) {
      const equal = t[i] === t[i + 1]
      if (equal) pairs += 1
      frames.push({ phase: 'pair', pythonLine: P('if t[i] == t[i + 1]'), activeLine: L('if (t[i] === t[i + 1])'), p, t, pairs, i, equal, rows: [...rows], answer, k,
        message: `Positions ${i} and ${i + 1} hold ${t[i]} and ${t[i + 1]}: ${equal ? 'equal pair' : 'no pair'}. Pairs so far ${pairs}.` })
    }
    rows.push({ p, t, pairs })
    const matches = pairs === k
    if (matches) answer += 1
    frames.push({ phase: 'tally', pythonLine: P('if pairs == k'), activeLine: L('if (pairs === k)'), p, t, pairs, i: null, rows: [...rows], answer, k, matches,
      message: matches ? `"${t}" has exactly ${k} equal pair${k === 1 ? '' : 's'}; count it. Answer ${answer}.` : `"${t}" has ${pairs} equal pair${pairs === 1 ? '' : 's'}, not ${k}.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return answer'), activeLine: L('return answer'), p: null, t: null, pairs: null, i: null, rows: [...rows], answer, k,
    message: `${answer} rotation position${answer === 1 ? '' : 's'} have exactly ${k} equal adjacent pairs.` })
  return { input: { s, k }, s, k, answer, frames }
}

export const pythonLineMap = {}
export const phases = [
  { id: 'setup', label: 'Read string', description: 'Measure the string and state k.' },
  { id: 'rotate', label: 'Rotate', description: 'Move one prefix to the end.' },
  { id: 'pair', label: 'Check neighbours', description: 'Compare each adjacent pair in the rotated text.' },
  { id: 'tally', label: 'Tally', description: 'Count the rotation when its pair total equals k.' },
  { id: 'done', label: 'Answer', description: 'Report how many rotations matched.' },
]
