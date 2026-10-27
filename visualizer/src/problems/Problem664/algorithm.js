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

export const code = `set dp[i][i] to 1 for every position i
for start i from the last index down to 0
  for end j from i + 1 to the last index
    set dp[i][j] to 1 + dp[i + 1][j], printing s[i] alone
    for each k from i + 1 through j where s[k] equals s[i]
      candidate is dp[i + 1][k - 1] (zero if that interval is empty) plus dp[k][j]
      set dp[i][j] to the smaller of dp[i][j] and candidate
return dp[0][last index]`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Collection trace: codeStage 'interval' is the per-interval update (line 7); 'return' is line 8.
const STAGE_LINE = { interval: 7, return: 8 }
export const LINE_MAP = { 1: 1, 4: 7, 5: 8 }

export function familyLine(frame) {
  return STAGE_LINE[frame.codeStage] ?? LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def strange_printer(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            dp[i][j] = 1 + dp[i + 1][j]
            for k in range(i + 1, j + 1):
                if s[k] == s[i]:
                    inner = dp[i + 1][k - 1] if k - 1 >= i + 1 else 0
                    dp[i][j] = min(dp[i][j], inner + dp[k][j])
    return dp[0][n - 1]`
