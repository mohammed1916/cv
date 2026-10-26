export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, k, row, column } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 20) throw new Error('n must be an integer from 1 to 20.')
  if (!Number.isInteger(k) || k < 0 || k > 50) throw new Error('k must be an integer from 0 to 50.')
  if (!Number.isInteger(row) || !Number.isInteger(column) || row < 0 || column < 0 || row >= n || column >= n) throw new Error('The start square must lie on the board.')
  return { n, k, row, column }
}

// dp[r][c] = probability the knight is on (r, c) after the moves so far; each move has 8 choices, 1/8 each.
export function buildTrace({ n, k, row, column }) {
  const moves = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
  let dp = Array.from({ length: n }, () => Array(n).fill(0))
  dp[row][column] = 1
  const frames = [{ phase: 'start', step: 0, board: dp.map(r => [...r]), activeLine: 2, message: `Knight starts at (${row}, ${column}).` }]
  for (let s = 1; s <= k; s++) {
    const next = Array.from({ length: n }, () => Array(n).fill(0))
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (!dp[r][c]) continue
      for (const [dr, dc] of moves) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < n && nc >= 0 && nc < n) next[nr][nc] += dp[r][c] / 8
      }
    }
    dp = next
    frames.push({ phase: 'move', step: s, board: dp.map(r => [...r]), activeLine: 6, message: `After move ${s}: ${dp.flat().reduce((a, b) => a + b, 0).toFixed(4)} probability still on the board.` })
  }
  const result = dp.flat().reduce((a, b) => a + b, 0)
  frames.push({ phase: 'done', step: k, board: dp.map(r => [...r]), result, activeLine: 9, message: `Probability the knight stays on the board: ${result.toFixed(6)}.` })
  return { input: { n, k, row, column }, result, frames }
}

export const code = `def knightProbability(n, k, row, col):
    dp = [[0.0] * n for _ in range(n)]
    dp[row][col] = 1.0
    for _ in range(k):
        nxt = [[0.0] * n for _ in range(n)]
        for r in range(n):
            for c in range(n):
                for dr, dc in MOVES:
                    if 0 <= r + dr < n and 0 <= c + dc < n:
                        nxt[r + dr][c + dc] += dp[r][c] / 8
        dp = nxt
    return sum(map(sum, dp))`.split('\n').map((text, index) => ({ line: index + 1, text }))
