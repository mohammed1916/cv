export const phases = [
  { id: 'start', label: 'Start', description: 'Place both robots in the top corners and count the cherries there.' },
  { id: 'transition', label: 'Move down', description: 'Each robot steps down, left, straight, or right. Every column pair is recomputed.' },
  { id: 'answer', label: 'Best finish', description: 'Choose the largest total among the column pairs on the last row.' },
  { id: 'done', label: 'Complete', description: 'Return the total.' },
]

export function parseInput(text) {
  const grid = JSON.parse(text)
  const ok = Array.isArray(grid) && grid.length >= 1 && grid.length <= 10 && grid.every(row =>
    Array.isArray(row) && row.length >= 2 && row.length <= 8 && row.length === grid[0].length &&
    row.every(v => Number.isInteger(v) && v >= 0 && v <= 100))
  if (!ok) throw new Error('Use a JSON array of 1 to 10 rows. Each row has the same 2 to 8 integers from 0 to 100.')
  return { grid }
}

const at = (activeLine, pythonLine = activeLine) => ({ activeLine, pythonLine })
const NEG = -Infinity

export function buildTrace({ grid }) {
  const rows = grid.length
  const cols = grid[0].length
  const cherries = (r, a, b) => grid[r][a] + (a === b ? 0 : grid[r][b])
  const table = t => t.map(row => row.map(v => (v === NEG ? null : v)))
  const best = t => Math.max(...t.flat())
  let dp = Array.from({ length: cols }, () => Array(cols).fill(NEG))
  dp[0][cols - 1] = cherries(0, 0, cols - 1)
  const frames = [{
    phase: 'start', ...at(4, 5),
    snapshot: { row: 0, table: table(dp), best: best(dp) },
    message: `Robots start at columns 0 and ${cols - 1}. Row 0 gives ${dp[0][cols - 1]} cherries.`,
  }]
  for (let r = 1; r < rows; r++) {
    const next = Array.from({ length: cols }, () => Array(cols).fill(NEG))
    for (let a = 0; a < cols; a++) {
      for (let b = 0; b < cols; b++) {
        let prev = NEG
        for (const pa of [a - 1, a, a + 1]) {
          for (const pb of [b - 1, b, b + 1]) {
            if (pa >= 0 && pa < cols && pb >= 0 && pb < cols) prev = Math.max(prev, dp[pa][pb])
          }
        }
        next[a][b] = prev + cherries(r, a, b)
      }
    }
    dp = next
    frames.push({
      phase: 'transition', ...at(8, 13),
      snapshot: { row: r, table: table(dp), best: best(dp) },
      message: `Row ${r}: each column pair takes its best reachable predecessor. Best total so far: ${best(dp)}.`,
    })
  }
  const result = best(dp)
  frames.push({ phase: 'answer', ...at(9, 15), snapshot: { row: rows - 1, table: table(dp), best: result }, message: `Largest total on the last row: ${result}.` })
  frames.push({ phase: 'done', ...at(9, 15), snapshot: { row: rows - 1, table: table(dp), best: result }, message: `Return ${result}.` })
  return { input: { grid }, result, frames }
}

export const code = [
  'max cherries (grid):',
  '  cols = number of columns',
  '  best[a][b] = negative infinity for every column pair',
  '  best[0][cols - 1] = cherries in row 0 at both corners',
  '  for each next row r:',
  '    for every column pair (a, b):',
  '      prev = best previous pair reachable by one step each',
  '      best[a][b] = prev + cherries at (r, a) and (r, b), once if a == b',
  '  return the largest value in best',
].map((text, index) => ({ line: index + 1, text }))

export const python = [
  'def cherry_pickup(grid):',
  '    cols = len(grid[0])',
  "    NEG = float('-inf')",
  '    dp = [[NEG] * cols for _ in range(cols)]',
  '    dp[0][cols - 1] = grid[0][0] + grid[0][cols - 1]',
  '    for r in range(1, len(grid)):',
  '        nxt = [[NEG] * cols for _ in range(cols)]',
  '        for a in range(cols):',
  '            for b in range(cols):',
  '                gain = grid[r][a] + (grid[r][b] if a != b else 0)',
  '                prev = max(dp[pa][pb] for pa in (a - 1, a, a + 1) for pb in (b - 1, b, b + 1)',
  '                           if 0 <= pa < cols and 0 <= pb < cols)',
  '                nxt[a][b] = prev + gain',
  '        dp = nxt',
  '    return max(max(row) for row in dp)',
].join('\n')
