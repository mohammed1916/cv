export function parseInput(text) {
  const data = JSON.parse(text)
  const { s1, s2 } = data ?? {}
  const ok = s => typeof s === 'string' && s.length >= 1 && s.length <= 60 && /^[a-z]+$/.test(s)
  if (!ok(s1) || !ok(s2)) throw new Error('s1 and s2 must be JSON strings of 1–60 lowercase letters.')
  return { s1, s2 }
}

// dp[i][j] = least ASCII sum to delete from s1[0..i) and s2[0..j) so the remainders match.
export function buildTrace({ s1, s2 }) {
  const n = s1.length, m = s2.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = 1; i <= n; i++) dp[i][0] = dp[i - 1][0] + s1.charCodeAt(i - 1)
  for (let j = 1; j <= m; j++) dp[0][j] = dp[0][j - 1] + s2.charCodeAt(j - 1)
  const frames = [{ phase: 'start', row: 0, column: 0, table: dp.map(r => [...r]), activeLine: 2, message: 'Empty prefixes: delete everything on the other side.' }]
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1]
    else dp[i][j] = Math.min(dp[i - 1][j] + s1.charCodeAt(i - 1), dp[i][j - 1] + s2.charCodeAt(j - 1))
    frames.push({ phase: s1[i - 1] === s2[j - 1] ? 'match' : 'choose', row: i, column: j, table: dp.map(r => [...r]), activeLine: s1[i - 1] === s2[j - 1] ? 6 : 8,
      message: s1[i - 1] === s2[j - 1] ? `'${s1[i - 1]}' matches: keep it, cost ${dp[i][j]}.` : `'${s1[i - 1]}' ≠ '${s2[j - 1]}': delete the cheaper one, cost ${dp[i][j]}.` })
  }
  const result = dp[n][m]
  frames.push({ phase: 'done', row: n, column: m, table: dp.map(r => [...r]), result, activeLine: 10, message: `Minimum ASCII delete sum: ${result}.` })
  return { input: { s1, s2 }, result, frames }
}

export const code = `set dp[i][0] to the sum of ASCII codes of the first i characters of s1, and dp[0][j] to the same for s2
for each i and j from 1
  if s1 at i and s2 at j are equal, set dp[i][j] to dp[i - 1][j - 1]
  otherwise set dp[i][j] to the smaller of dp[i - 1][j] plus the ASCII code of s1 at i, and dp[i][j - 1] plus the ASCII code of s2 at j
return dp[m][n]`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 4 either keeps a matching pair on the diagonal (line 3 here) or pays the cheaper deletion (line 4 here).
export function familyLine(frame) {
  if (frame.activeLine === 4) return /Matching/.test(frame.message) ? 3 : 4
  return ({ 1: 1, 5: 5 })[frame.activeLine] ?? frame.activeLine
}

export const python = `def minimum_delete_sum(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        dp[i][0] = dp[i - 1][0] + ord(s1[i - 1])
    for j in range(1, n + 1):
        dp[0][j] = dp[0][j - 1] + ord(s2[j - 1])
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(dp[i - 1][j] + ord(s1[i - 1]), dp[i][j - 1] + ord(s2[j - 1]))
    return dp[m][n]`
