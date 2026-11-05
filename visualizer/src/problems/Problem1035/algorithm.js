export const phases = [
  { id: 'setup', label: 'Table', description: 'Create a blank table with one extra row and column of zeros for the empty prefixes.' },
  { id: 'fill', label: 'Fill', description: 'Each cell records the best number of links using the two prefixes that end at its row and column.' },
  { id: 'done', label: 'Answer', description: 'The bottom-right cell covers both complete arrays.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!Array.isArray(data) || data.length !== 2 || data.some(arr => !Array.isArray(arr))) throw new Error('Enter [firstArray, secondArray] as two JSON arrays.')
  if (data.some(arr => arr.length < 1 || arr.length > 20 || arr.some(v => !Number.isInteger(v) || v < 0 || v > 9))) throw new Error('Each array needs 1–20 integers from 0 to 9.')
  return data
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace([a, b]) {
  const n = a.length, m = b.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  const frames = []
  const snap = (extra = {}) => ({ a, b, dp: dp.map(row => row.slice()), ...extra })
  frames.push({ phase: 'setup', activeLine: L('const dp'), pythonLine: PY('dp = [[0]'), message: `The table is ${n + 1} by ${m + 1}. Row 0 and column 0 mean an empty prefix, so they stay 0.`, snapshot: snap({ i: 0, j: 0, match: null }) })
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = a[i - 1] === b[j - 1]
      if (match) dp[i][j] = dp[i - 1][j - 1] + 1
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      frames.push({
        phase: 'fill', activeLine: match ? L('if (a[i - 1] === b[j - 1])') + 0 : L('else dp[i][j]'), pythonLine: match ? PY('dp[i][j] = dp[i - 1][j - 1] + 1') : PY('dp[i][j] = max'),
        message: match
          ? `a[${i - 1}] = b[${j - 1}] = ${a[i - 1]}. Link them, so dp = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`
          : `a[${i - 1}] = ${a[i - 1]} and b[${j - 1}] = ${b[j - 1]} differ. Skip one side: the larger of the two neighbours gives ${dp[i][j]}.`,
        snapshot: snap({ i, j, match }),
      })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return dp[n][m]'), pythonLine: PY('return dp[n][m]'), message: `The bottom-right cell is ${dp[n][m]}: the most links possible.`, snapshot: snap({ i: n, j: m, match: null }) })
  return { input: [a, b], result: dp[n][m], frames }
}

export const code = `function maxUncrossedLines(a, b) {
  const n = a.length
  const m = b.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[n][m]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_uncrossed_lines(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]`

export const pythonLineMap = {}
