// Count pairs of substrings (one from each string, same length) that differ in exactly one position.
const JS_LINES = [
  { text: 'let count = 0', py: 'count = 0' },
  { text: 'for (let i = 0; i < s.length; i++) {', py: 'for i in range(len(s))' },
  { text: 'for (let j = 0; j < t.length; j++) {', py: 'for j in range(len(t))' },
  { text: 'let diffs = 0', py: 'diffs = 0' },
  { text: 'for (let k = 0; i + k < s.length && j + k < t.length; k++) {', py: 'for k in range' },
  { text: 'if (s[i + k] !== t[j + k]) diffs++', py: 'if s[i + k] != t[j + k]' },
  { text: 'if (diffs === 1) count++', py: 'if diffs == 1' },
  { text: 'if (diffs > 1) break', py: 'if diffs > 1' },
  { text: '}', py: null },
  { text: '}', py: null },
  { text: '}', py: null },
  { text: 'return count', py: 'return count' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def countSubstrings(s, t):
    count = 0
    for i in range(len(s)):
        for j in range(len(t)):
            diffs = 0
            for k in range(min(len(s) - i, len(t) - j)):
                if s[i + k] != t[j + k]:
                    diffs += 1
                if diffs == 1:
                    count += 1
                if diffs > 1:
                    break
    return count
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return count')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no pairs counted.' },
  { id: 'pair', label: 'Pair', description: 'Line up substrings that start at i in s and at j in t.' },
  { id: 'extend', label: 'Extend', description: 'Grow both substrings one character at a time and track the mismatches.' },
  { id: 'done', label: 'Result', description: 'Every length with exactly one mismatch was counted.' },
]

export const examples = [
  { label: 'Two short words', input: '{"s":"abcd","t":"bacd"}' },
  { label: 'Equal strings', input: '{"s":"aa","t":"aa"}' },
  { label: 'Different letters', input: '{"s":"xyz","t":"pqr"}' },
  { label: 'One letter each', input: '{"s":"a","t":"a"}' },
  { label: 'Repeated letters', input: '{"s":"aaa","t":"aa"}' },
  { label: 'Longest strings', input: '{"s":"abcdefgh","t":"hgfedcba"}' },
  { label: 'Long run: 8 letters each', input: '{"s":"edadabba","t":"bbeeeacb"}' },
]

export const complexity = 'O(n * m * min(n, m)) time for strings of lengths n and m. The visual caps each string at 8 characters.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string' || typeof input.t !== 'string') throw new Error('Use an object with strings s and t.')
  if (input.s.length < 1 || input.t.length < 1 || input.s.length > 8 || input.t.length > 8) throw new Error('Each string has 1 to 8 characters (visual cap).')
  if (!/^[a-z]+$/.test(input.s) || !/^[a-z]+$/.test(input.t)) throw new Error('Use lowercase letters only.')
  return { s: input.s, t: input.t }
}

export function buildTrace({ s, t }) {
  const frames = []
  let count = 0
  const snap = extra => ({ count, ...extra })
  frames.push({ phase: 'start', activeLine: 1, i: -1, j: -1, message: 'No pairs counted yet.', snapshot: snap({}) })
  for (let i = 0; i < s.length; i++) {
    for (let j = 0; j < t.length; j++) {
      frames.push({ phase: 'pair', activeLine: 3, i, j, message: `Start at s[${i}] and t[${j}].`, snapshot: snap({}) })
      let diffs = 0
      for (let k = 0; i + k < s.length && j + k < t.length; k++) {
        if (s[i + k] !== t[j + k]) diffs++
        if (diffs === 1) {
          count++
          frames.push({ phase: 'extend', activeLine: 7, i, j, len: k + 1, diffs, message: `Length ${k + 1}: exactly one mismatch, count is ${count}.`, snapshot: snap({}) })
        }
        if (diffs > 1) {
          frames.push({ phase: 'extend', activeLine: 8, i, j, len: k + 1, diffs, message: `Length ${k + 1} has ${diffs} mismatches: stop extending.`, snapshot: snap({}) })
          break
        }
      }
    }
  }
  frames.push({ phase: 'done', activeLine: 12, i: -1, j: -1, result: count, message: `Total pairs: ${count}.`, snapshot: snap({ result: count }) })
  return { input: { s, t }, result: count, frames }
}
