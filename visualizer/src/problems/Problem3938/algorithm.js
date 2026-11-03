export const phases = [
  { id: 'start', label: 'Setup', description: 'Both walkers begin in the grid corners.' },
  { id: 'column', label: 'Column', description: 'Move every reachable pair of walkers through one column.' },
  { id: 'walk', label: 'Walk back', description: 'Rebuild the best pair of paths column by column.' },
  { id: 'done', label: 'Result', description: 'Report the best shared sum.' },
]

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 2 || grid.length > 8) throw new Error('Use a JSON array of 2 to 8 rows.')
  const cols = grid[0] && grid[0].length
  if (!Number.isInteger(cols) || cols < 2 || cols > 8) throw new Error('Each row has 2 to 8 values.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== cols) throw new Error('Every row must have the same length.')
    if (!row.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) throw new Error('Cell values are integers from -100 to 100.')
  }
  return { grid }
}

const matrix = (rows, cols, value) => Array.from({ length: rows }, () => Array(cols).fill(value))

export function buildTrace({ grid }) {
  const n = grid.length
  const m = grid[0].length
  const NEG = -Infinity
  let dp = matrix(n, n, NEG)
  dp[0][n - 1] = 0
  let answer = NEG
  let finalEntry = null
  const parents = []
  const frames = [{ phase: 'start', activeLine: L('let rows and cols'), pythonLine: P('n = len(grid)'), message: `Walker A enters at the top-left, walker B at the bottom-left. The grid has ${n} rows and ${m} columns.`, column: -1, states: 1, bestNow: 0, picks: [], shared: 0 }]
  for (let c = 0; c < m; c++) {
    const next = matrix(n, n, NEG)
    const par = matrix(n, n, null)
    let states = 0
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        if (dp[a][b] === NEG) continue
        states++
        for (let a2 = a; a2 < n; a2++) {
          for (let b2 = 0; b2 <= b; b2++) {
            if (c === m - 1 && (a2 !== n - 1 || b2 !== 0)) continue
            const lo = Math.max(a, b2)
            const hi = Math.min(a2, b)
            let gain = 0
            for (let r = lo; r <= hi; r++) gain += grid[r][c]
            const value = dp[a][b] + gain
            if (c === m - 1) {
              if (value > answer) {
                answer = value
                finalEntry = [a, b]
              }
            } else if (value > next[a2][b2]) {
              next[a2][b2] = value
              par[a2][b2] = [a, b]
            }
          }
        }
      }
    }
    parents.push(par)
    let bestNow = NEG
    for (const row of next) for (const v of row) if (v > bestNow) bestNow = v
    if (c === m - 1) bestNow = answer
    frames.push({ phase: 'column', activeLine: L('for each column c'), pythonLine: P('for c in range(m)'), message: `Column ${c}: ${states} reachable pair${states === 1 ? '' : 's'} of entry rows checked.`, column: c, states, bestNow, picks: [], shared: 0 })
    dp = next
  }
  const picks = Array(m)
  picks[m - 1] = { a: finalEntry[0], b: finalEntry[1], a2: n - 1, b2: 0 }
  for (let c = m - 2; c >= 0; c--) {
    const exit = picks[c + 1]
    const [a, b] = parents[c][exit.a][exit.b]
    picks[c] = { a, b, a2: exit.a, b2: exit.b }
  }
  let shared = 0
  for (let c = 0; c < m; c++) {
    const p = picks[c]
    const lo = Math.max(p.a, p.b2)
    const hi = Math.min(p.a2, p.b)
    for (let r = lo; r <= hi; r++) shared += grid[r][c]
    frames.push({ phase: 'walk', activeLine: L('for each exit (a2, b2)'), pythonLine: P('for a2 in range(a, n)'), message: `Column ${c}: A runs rows ${p.a} to ${p.a2}, B runs rows ${p.b2} to ${p.b}. Shared total so far ${shared}.`, column: c, states: 0, bestNow: answer, picks: picks.slice(0, c + 1), shared })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), message: `The best shared sum is ${answer}.`, column: m, states: 0, bestNow: answer, picks: picks.slice(), shared })
  return { input: { grid }, result: answer, frames }
}

export const code = `maximum shared path sum
  let rows and cols be the grid size
  let best[a][b] be negative infinity, except best[0][rows minus 1] equal to 0
  for each column c from 0 to cols minus 1
    let next[a][b] be negative infinity
    for each reachable state (a, b) in best
      for each exit (a2, b2) with a2 at or below a and b2 at or above b
        add the shared cells of column c between max(a, b2) and min(a2, b)
        if c is the last column then require (a2, b2) to be the corner, and keep the total as the answer
        otherwise keep the total in next[a2][b2] when it is larger
    set best to next
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_path_intersection(grid):
    n = len(grid)
    m = len(grid[0])
    NEG = float('-inf')
    dp = [[NEG] * n for _ in range(n)]
    dp[0][n - 1] = 0
    answer = NEG
    for c in range(m):
        nxt = [[NEG] * n for _ in range(n)]
        for a in range(n):
            for b in range(n):
                if dp[a][b] == NEG:
                    continue
                for a2 in range(a, n):
                    for b2 in range(0, b + 1):
                        if c == m - 1 and (a2 != n - 1 or b2 != 0):
                            continue
                        lo = max(a, b2)
                        hi = min(a2, b)
                        gain = sum(grid[r][c] for r in range(lo, hi + 1))
                        value = dp[a][b] + gain
                        if c == m - 1:
                            answer = max(answer, value)
                        else:
                            nxt[a2][b2] = max(nxt[a2][b2], value)
        dp = nxt
    return answer`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
