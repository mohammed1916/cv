// Sorted vowel strings: dp[v] counts the strings of the current length that end with vowel v.
const JS_LINES = [
  { text: 'const dp = [1, 1, 1, 1, 1]', py: 'dp = [1] * 5' },
  { text: 'for (let length = 2; length <= n; length++) {', py: 'for _ in range' },
  { text: 'for (let v = 1; v < 5; v++) dp[v] += dp[v - 1]', py: 'for v in range(1, 5)' },
  { text: 'dp[v] += dp[v - 1]', py: 'dp[v] += dp[v - 1]' },
  { text: '}', py: null },
  { text: 'return dp.reduce((sum, x) => sum + x, 0)', py: 'return sum(dp)' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def countVowelStrings(n):
    dp = [1] * 5
    for _ in range(2, n + 1):
        for v in range(1, 5):
            dp[v] += dp[v - 1]
    return sum(dp)
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return sum(dp)')]))

export const phases = [
  { id: 'start', label: 'Length 1', description: 'One vowel: each of the five vowels is a string by itself.' },
  { id: 'extend', label: 'Extend', description: 'A string may only add a vowel that is not before its last one, so each entry adds the entries to its left.' },
  { id: 'done', label: 'Result', description: 'Adding up the last row counts every sorted string.' },
]

export const examples = [
  { label: 'Length three', input: '3' },
  { label: 'Length four', input: '4' },
  { label: 'Length one', input: '1' },
]

export const complexity = 'O(n) time and O(1) space for length n (the table has five columns).'

export function parseInput(text) {
  const n = Number(text.trim())
  if (!Number.isInteger(n) || n < 1 || n > 50) throw new Error('Enter an integer from 1 to 50.')
  return n
}

export function buildTrace(n) {
  const frames = []
  const rows = []
  let dp = [1, 1, 1, 1, 1]
  rows.push([...dp])
  const snap = extra => ({ dp: [...dp], rows: rows.map(r => [...r]), ...extra })
  frames.push({ phase: 'start', activeLine: 1, length: 1, message: 'Length 1: each vowel alone counts once.', snapshot: snap({}) })
  for (let length = 2; length <= n; length++) {
    for (let v = 1; v < 5; v++) {
      dp[v] += dp[v - 1]
    }
    rows.push([...dp])
    frames.push({ phase: 'extend', activeLine: 3, length, message: `Length ${length}: each vowel adds the counts to its left, row is [${dp.join(', ')}].`, snapshot: snap({}) })
  }
  const total = dp.reduce((sum, x) => sum + x, 0)
  frames.push({ phase: 'done', activeLine: 6, length: n, result: total, message: `Total sorted strings of length ${n}: ${total}.`, snapshot: snap({ result: total }) })
  return { input: n, result: total, rows, frames }
}
