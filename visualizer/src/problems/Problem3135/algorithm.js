// LeetCode 3135: the cheapest way to make two strings equal when each step adds or removes
// one character at an end of either string. Both strings must shrink to a shared piece, and
// that piece must be a contiguous run of both. So the answer is len(s) + len(t) - 2 * L,
// where L is the length of the longest common substring. A table of matching runs finds L.

const MAX_LENGTH = 12

const CODE_TEXT = `FUNCTION minOperations(s, t)
    run ← table of zeros with len(s) + 1 rows and len(t) + 1 columns
    best ← 0
    FOR i from 1 to len(s)
        FOR j from 1 to len(t)
            IF s[i-1] equals t[j-1] THEN run[i][j] ← run[i-1][j-1] + 1
            ELSE run[i][j] ← 0
            best ← max(best, run[i][j])
    RETURN len(s) + len(t) - 2 × best`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def min_operations(s, t):
    m, n = len(s), len(t)
    run = [[0] * (n + 1) for _ in range(m + 1)]
    best = 0
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s[i - 1] == t[j - 1]:
                run[i][j] = run[i - 1][j - 1] + 1
            else:
                run[i][j] = 0
            best = max(best, run[i][j])
    return m + n - 2 * best
`
const PY = s => {
  const index = python.split('\n').findIndex(c => c.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and t.')
  const { s, t } = input
  for (const [name, value] of [['s', s], ['t', t]]) {
    if (typeof value !== 'string' || value.length < 1 || value.length > MAX_LENGTH || !/^[a-z]+$/.test(value)) {
      throw new Error(`${name} has 1 to ${MAX_LENGTH} lowercase letters in this visualization.`)
    }
  }
  return { s, t }
}

export function buildTrace({ s, t }) {
  const m = s.length
  const n = t.length
  const run = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const snapshot = () => run.map(row => row.slice())
  const frames = []
  let best = 0
  frames.push({ phase: 'start', pythonLine: PY('run = [[0]'), activeLine: L('table of zeros'), s, t, row: 0, col: 0, best, table: snapshot(), message: `Start with a zero table: ${m} row${m === 1 ? '' : 's'} for s and ${n} column${n === 1 ? '' : 's'} for t.` })
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      frames.push({ phase: 'compare', pythonLine: PY('if s[i - 1] == t[j - 1]'), activeLine: L('IF s[i-1] equals t[j-1]'), s, t, row: i, col: j, best, table: snapshot(), message: `Compare s[${i - 1}] = ${s[i - 1]} with t[${j - 1}] = ${t[j - 1]}.` })
      if (s[i - 1] === t[j - 1]) {
        run[i][j] = run[i - 1][j - 1] + 1
        best = Math.max(best, run[i][j])
        frames.push({ phase: 'match', pythonLine: PY('run[i][j] = run[i - 1][j - 1] + 1'), activeLine: L('THEN run[i][j]'), s, t, row: i, col: j, best, table: snapshot(), message: `They match, so the run grows to ${run[i][j]}; best run is ${best}.` })
      } else {
        run[i][j] = 0
        frames.push({ phase: 'miss', pythonLine: PY('run[i][j] = 0'), activeLine: L('ELSE run[i][j] ← 0'), s, t, row: i, col: j, best, table: snapshot(), message: `They differ, so this run resets to 0; best run stays ${best}.` })
      }
    }
  }
  const result = m + n - 2 * best
  frames.push({ phase: 'done', pythonLine: PY('return m + n'), activeLine: L('RETURN len(s)'), s, t, row: 0, col: 0, best, table: snapshot(), message: `Keep ${best} shared characters: ${m} + ${n} - 2 × ${best} = ${result} operations.` })
  return { input: { s, t }, result, frames }
}
