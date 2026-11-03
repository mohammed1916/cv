const PHASES = [
  { id: 'round', label: 'Round', description: 'Start a pass over the current string.' },
  { id: 'scan', label: 'Scan', description: 'Test a left index i and a right index j within distance k.' },
  { id: 'merge', label: 'Merge', description: 'Delete the right character and keep the left one.' },
  { id: 'done', label: 'Result', description: 'No close equal pair remains.' },
]

export const phases = PHASES

const CODE_LINES = [
  'merge close characters within distance k',
  'repeat until no pair is found',
  '  for i from 0 to the last index',
  '    for j from i plus 1 up to i plus k',
  '      if s at i equals s at j then record the pair (i, j) and stop',
  '    if a pair was recorded then stop scanning i',
  '  if no pair was recorded then return s',
  '  delete the character at index j from s',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `def merge_close(s, k):
    while True:
        pair = None
        for i in range(len(s)):
            for j in range(i + 1, min(len(s), i + k + 1)):
                if s[i] == s[j]:
                    pair = (i, j)
                    break
            if pair is not None:
                break
        if pair is None:
            return s
        j = pair[1]
        s = s[:j] + s[j + 1:]
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 16 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 16 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 16) throw new Error('k is an integer from 1 to 16.')
  return { s, k }
}

export function buildTrace({ s: start, k }) {
  const frames = []
  let s = start
  let removed = []
  const base = { k, removed: [] }
  frames.push({ ...base, pythonLine: P('def merge_close'), phase: 'round', activeLine: L('merge close characters'), s, i: -1, j: -1, matched: false, message: `Start with ${s}; a pair must be at most ${k} apart.` })
  for (;;) {
    frames.push({ ...base, removed: [...removed], pythonLine: P('while True'), phase: 'round', activeLine: L('repeat until'), s, i: -1, j: -1, matched: false, message: `New pass over ${s}.` })
    let pair = null
    for (let i = 0; i < s.length && !pair; i++) {
      for (let j = i + 1; j < Math.min(s.length, i + k + 1); j++) {
        const equal = s[i] === s[j]
        frames.push({ ...base, removed: [...removed], pythonLine: P('if s[i] == s[j]'), phase: 'scan', activeLine: L('if s at i equals'), s, i, j, matched: equal, message: equal ? `${s[i]} at ${i} matches ${s[j]} at ${j}.` : `${s[i]} at ${i} and ${s[j]} at ${j} differ.` })
        if (equal) { pair = [i, j]; break }
      }
    }
    if (!pair) {
      frames.push({ ...base, removed: [...removed], pythonLine: P('return s'), phase: 'done', activeLine: L('if no pair was recorded'), s, i: -1, j: -1, matched: false, message: `No close equal pair remains; the result is ${s}.` })
      return { input: { s: start, k }, result: s, frames }
    }
    const [i, j] = pair
    const next = s.slice(0, j) + s.slice(j + 1)
    removed = [...removed, { index: j, char: s[j] }]
    frames.push({ ...base, removed: [...removed], pythonLine: P('s = s[:j]'), phase: 'merge', activeLine: L('delete the character'), s: next, i, j, matched: true, message: `Delete ${s[j]} at ${j}, keeping ${s[i]} at ${i}; the string becomes ${next}.` })
    s = next
  }
}
