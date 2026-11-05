export function parseInput(text) {
  const data = JSON.parse(text)
  const { s1, s2 } = data ?? {}
  const ok = s => typeof s === 'string' && s.length >= 1 && s.length <= 60 && /^[a-z]+$/.test(s)
  if (!ok(s1) || !ok(s2)) throw new Error('s1 and s2 must be JSON strings of 1–60 lowercase letters.')
  return { s1, s2 }
}

const JS_LINES = [
  'function minimumDeleteSum(s1, s2) {',
  '  const m = s1.length, n = s2.length',
  '  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0)) // dp[i][j] = cheapest deletion cost for the two prefixes',
  '  for (let i = 1; i <= m; i++) dp[i][0] = dp[i - 1][0] + s1.charCodeAt(i - 1) // delete all of s1 prefix',
  '  for (let j = 1; j <= n; j++) dp[0][j] = dp[0][j - 1] + s2.charCodeAt(j - 1) // delete all of s2 prefix',
  '  for (let i = 1; i <= m; i++) {',
  '    for (let j = 1; j <= n; j++) {',
  '      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1] // matching characters cost nothing',
  '      else dp[i][j] = Math.min(dp[i - 1][j] + s1.charCodeAt(i - 1), dp[i][j - 1] + s2.charCodeAt(j - 1)) // delete the cheaper one',
  '    }',
  '  }',
  '  return dp[m][n]',
  '}',
]
const PY_LINES = [
  'def minimum_delete_sum(s1, s2):',
  '    m, n = len(s1), len(s2)',
  '    dp = [[0] * (n + 1) for _ in range(m + 1)]',
  '    for i in range(1, m + 1):',
  '        dp[i][0] = dp[i - 1][0] + ord(s1[i - 1])',
  '    for j in range(1, n + 1):',
  '        dp[0][j] = dp[0][j - 1] + ord(s2[j - 1])',
  '    for i in range(1, m + 1):',
  '        for j in range(1, n + 1):',
  '            if s1[i - 1] == s2[j - 1]:',
  '                dp[i][j] = dp[i - 1][j - 1]',
  '            else:',
  '                dp[i][j] = min(dp[i - 1][j] + ord(s1[i - 1]), dp[i][j - 1] + ord(s2[j - 1]))',
  '    return dp[m][n]',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// dp[i][j] = least ASCII sum to delete from the first i characters of s1 and first j of s2 so the rest matches.
export function buildTrace({ s1, s2 }) {
  const n = s1.length, m = s2.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = 1; i <= n; i++) dp[i][0] = dp[i - 1][0] + s1.charCodeAt(i - 1)
  for (let j = 1; j <= m; j++) dp[0][j] = dp[0][j - 1] + s2.charCodeAt(j - 1)
  const frames = [{ phase: 'start', row: 0, column: 0, sources: [], table: dp.map(r => [...r]), activeLine: L('dp[i][0]'), pythonLine: P('dp[i][0]'), message: 'Empty prefixes: delete everything on the other side, one character at a time.' }]
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const match = s1[i - 1] === s2[j - 1]
    if (match) dp[i][j] = dp[i - 1][j - 1]
    else dp[i][j] = Math.min(dp[i - 1][j] + s1.charCodeAt(i - 1), dp[i][j - 1] + s2.charCodeAt(j - 1))
    const sources = match ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]]
    frames.push({ phase: match ? 'match' : 'choose', row: i, column: j, sources, table: dp.map(r => [...r]),
      activeLine: L(match ? 'matching characters' : 'delete the cheaper one'), pythonLine: P(match ? 'dp[i][j] = dp[i - 1][j - 1]' : 'min('),
      message: match ? `'${s1[i - 1]}' matches '${s2[j - 1]}': keep it and copy dp[${i - 1}][${j - 1}] = ${dp[i][j]}.` : `'${s1[i - 1]}' ≠ '${s2[j - 1]}': take the cheaper of deleting '${s1[i - 1]}' or '${s2[j - 1]}', giving ${dp[i][j]}.` })
  }
  const result = dp[n][m]
  frames.push({ phase: 'done', row: n, column: m, sources: [], table: dp.map(r => [...r]), result, activeLine: L('return dp[m][n]'), pythonLine: P('return dp[m][n]'), message: `Minimum ASCII delete sum: ${result}.` })
  return { input: { s1, s2 }, result, frames }
}
