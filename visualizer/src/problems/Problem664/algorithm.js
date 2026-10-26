export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 24 || ![...s].every(c => c >= 'a' && c <= 'z')) throw new Error('Enter a JSON string of 1–24 lowercase letters (the table is shown in full).')
  return s
}

// best[i][j] = fewest turns to print s[i..j]. Either s[i] is printed with the first turn (and merged with the
// matching position k), or it is printed alone.
export function buildTrace(s) {
  const n = s.length
  const best = Array.from({ length: n }, () => Array(n).fill(0))
  const frames = [{ phase: 'start', i: 0, j: 0, table: best.map(r => [...r]), activeLine: 2, message: 'A single character needs one turn.' }]
  for (let i = 0; i < n; i++) best[i][i] = 1
  for (let len = 2; len <= n; len++) for (let i = 0; i + len - 1 < n; i++) {
    const j = i + len - 1
    let value = 1 + best[i + 1][j]
    if (s[i] === s[i + 1]) value = best[i + 1][j]
    for (let k = i + 1; k <= j; k++) {
      if (s[k] === s[i]) {
        const merged = (k > i + 1 ? best[i + 1][k - 1] : 0) + best[k][j]
        if (merged < value) value = merged
      }
    }
    best[i][j] = value
    frames.push({ phase: 'cell', i, j, table: best.map(r => [...r]), activeLine: 8, message: `s[${i}..${j}] = "${s.slice(i, j + 1)}": ${value} turns.` })
  }
  frames.push({ phase: 'done', i: 0, j: n - 1, table: best.map(r => [...r]), result: best[0][n - 1], activeLine: 10, message: `Minimum turns: ${best[0][n - 1]}.` })
  return { input: s, result: best[0][n - 1], table: best, frames }
}

export const code = `def strangePrinter(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            dp[i][j] = 1 + dp[i + 1][j] if s[i] != s[i + 1] else dp[i + 1][j]
            for k in range(i + 1, j + 1):
                if s[k] == s[i]: dp[i][j] = min(dp[i][j], dp[i + 1][k - 1] + dp[k][j] if k > i + 1 else dp[k][j])
    return dp[0][n - 1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
