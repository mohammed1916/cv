const MOD = 1000000007

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 12 || !/^[a-d]+$/.test(s)) throw new Error('Enter a JSON string of 1–12 letters from a to d (the table is shown in full).')
  return s
}

// dp[i][j] = distinct palindromic subsequences inside s[i..j]. Equal ends extend the inner count and
// subtract the palindromes already counted between the nearest matching letters.
export function buildTrace(s) {
  const n = s.length
  const dp = Array.from({ length: n }, () => Array(n).fill(0))
  const frames = []
  for (let i = 0; i < n; i++) dp[i][i] = 1
  frames.push({ phase: 'base', row: 0, column: 0, table: dp.map(r => [...r]), activeLine: 2, pythonLine: 6, message: 'Single letters: one palindrome each.' })
  for (let len = 2; len <= n; len++) for (let i = 0; i + len - 1 < n; i++) {
    const j = i + len - 1
    const inner = i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0
    if (s[i] !== s[j]) {
      dp[i][j] = ((dp[i + 1][j] + dp[i][j - 1] - inner) % MOD + MOD) % MOD
      frames.push({ phase: 'mismatch', row: i, column: j, table: dp.map(r => [...r]), activeLine: 6, pythonLine: 12, message: `s[${i}] ≠ s[${j}]: add both sides, remove the overlap.` })
      continue
    }
    let l = i + 1, r = j - 1
    while (l <= j && s[l] !== s[i]) l++
    while (r >= i && s[r] !== s[i]) r--
    if (l > r) dp[i][j] = (2 * inner + 2) % MOD
    else if (l === r) dp[i][j] = (2 * inner + 1) % MOD
    else dp[i][j] = ((2 * inner - dp[l + 1][r - 1]) % MOD + MOD) % MOD
    frames.push({ phase: 'match', row: i, column: j, table: dp.map(r2 => [...r2]), activeLine: l > r ? 8 : l === r ? 9 : 10, pythonLine: l > r ? 20 : l === r ? 22 : 24, message: `s[${i}] = s[${j}] = ${s[i]}: ${l > r ? 'no inner match' : l === r ? 'one inner match' : 'two inner matches'}; count ${dp[i][j]}.` })
  }
  const result = dp[0][n - 1]
  frames.push({ phase: 'done', row: 0, column: n - 1, table: dp.map(r => [...r]), result, activeLine: 12, pythonLine: 26, message: `Distinct palindromic subsequences: ${result}.` })
  return { input: s, result, frames }
}

export const code = `set n to the length of s, and MOD to 1000000007
set dp[i][i] to 1 for every single letter
for each length from 2 to n
  for each start i, with end j = i + length - 1
    set inner to dp[i+1][j-1], or 0 when that range is empty
    if s[i] differs from s[j], set dp[i][j] to dp[i+1][j] plus dp[i][j-1] minus inner
    otherwise find the nearest matching letters l from the left and r from the right inside
      if there is no inner match, set dp[i][j] to 2 times inner plus 2
      if there is exactly one inner match, set dp[i][j] to 2 times inner plus 1
      if there are two or more, set dp[i][j] to 2 times inner minus dp[l+1][r-1]
    reduce dp[i][j] modulo MOD
return dp[0][n-1]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_palindromic_subsequences(s):
    MOD = 10**9 + 7
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            inner = dp[i + 1][j - 1] if i + 1 <= j - 1 else 0
            if s[i] != s[j]:
                dp[i][j] = dp[i + 1][j] + dp[i][j - 1] - inner
            else:
                l, r = i + 1, j - 1
                while l <= j and s[l] != s[i]:
                    l += 1
                while r >= i and s[r] != s[i]:
                    r -= 1
                if l > r:
                    dp[i][j] = 2 * inner + 2
                elif l == r:
                    dp[i][j] = 2 * inner + 1
                else:
                    dp[i][j] = 2 * inner - dp[l + 1][r - 1]
            dp[i][j] %= MOD
    return dp[0][n - 1]`
