export function parseInput(text) {
  const piles = JSON.parse(text)
  if (!Array.isArray(piles) || piles.length < 2 || piles.length > 20 || piles.length % 2 !== 0 ||
    piles.some(p => !Number.isInteger(p) || p < 1 || p > 500) || piles.reduce((a, b) => a + b, 0) % 2 === 0) {
    throw new Error('Enter an even-length JSON array of 2–20 piles (visualization cap), each 1–500, with an odd total so there are no ties.')
  }
  return piles
}

export function buildTrace(piles) {
  const n = piles.length
  const dp = Array.from({ length: n }, () => Array(n).fill(null))
  const snap = () => dp.map(row => row.map(v => (v === null ? '' : v)))
  const frames = [{ phase: 'start', table: snap(), cell: null, related: [], activeLine: L('let dp be an n by n'), message: 'dp[i][j] will hold the best lead (current mover minus opponent) on piles i..j.' }]
  for (let i = 0; i < n; i++) {
    dp[i][i] = piles[i]
    frames.push({ phase: 'base', table: snap(), cell: { row: i, column: i }, related: [], activeLine: L('set dp[i][i] to piles[i]'), message: `With only pile ${i} left the mover takes it: dp[${i}][${i}] = ${piles[i]}.` })
  }
  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length <= n; i++) {
      const j = i + length - 1
      const takeLeft = piles[i] - dp[i + 1][j]
      const takeRight = piles[j] - dp[i][j - 1]
      dp[i][j] = Math.max(takeLeft, takeRight)
      frames.push({
        phase: 'fill', table: snap(), cell: { row: i, column: j }, related: [{ row: i + 1, column: j }, { row: i, column: j - 1 }], activeLine: L('set dp[i][j] to the larger'),
        message: `Piles ${i}..${j}: take left = ${piles[i]} - dp[${i + 1}][${j}] = ${takeLeft}, take right = ${piles[j]} - dp[${i}][${j - 1}] = ${takeRight}. The mover keeps the larger: ${dp[i][j]}.`,
      })
    }
  }
  const result = dp[0][n - 1] > 0
  frames.push({ phase: 'done', table: snap(), cell: { row: 0, column: n - 1 }, related: [], activeLine: L('return whether dp'), message: `dp[0][${n - 1}] = ${dp[0][n - 1]}, so Alex ${result ? 'can' : 'cannot'} win: ${result}.` })
  return { input: [...piles], result, frames }
}

export const code = `let n be the number of piles
let dp be an n by n table, where dp[i][j] is the best lead on piles i..j
for each i from 0 to n - 1, do
  set dp[i][i] to piles[i]
for each length from 2 to n, do
  for each start i from 0 to n - length, do
    let j be i + length - 1
    set dp[i][j] to the larger of piles[i] - dp[i+1][j] and piles[j] - dp[i][j-1]
return whether dp[0][n-1] is positive`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def stone_game(piles):
    n = len(piles)
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = piles[i]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = max(piles[i] - dp[i + 1][j], piles[j] - dp[i][j - 1])
    return dp[0][n - 1] > 0
`
