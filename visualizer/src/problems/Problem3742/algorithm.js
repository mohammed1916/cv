export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.grid) || !Number.isInteger(obj.k)) throw new Error('Use an object with a grid array and an integer k.')
  const m = obj.grid.length
  if (m < 1 || m > 4) throw new Error('Use 1 to 4 rows for the visualization.')
  const n = obj.grid[0].length
  if (obj.grid.some(row => !Array.isArray(row) || row.length !== n || n < 1 || n > 4)) throw new Error('Every row needs the same length, from 1 to 4.')
  if (obj.grid.some(row => row.some(v => ![0, 1, 2].includes(v)))) throw new Error('Cells are 0, 1 or 2.')
  if (obj.grid[0][0] !== 0) throw new Error('The top-left cell must be 0.')
  if (obj.k < 0 || obj.k > 12) throw new Error('k is an integer from 0 to 12 for the visualization.')
  return { grid: obj.grid, k: obj.k }
}

export function buildTrace(input) {
  const { grid, k } = input
  const m = grid.length, n = grid[0].length
  const NEG = -Infinity
  const best = Array.from({ length: m }, () => Array.from({ length: n }, () => Array(k + 1).fill(NEG)))
  best[0][0][0] = 0
  const frames = [{ phase: 'start', activeLine: L('set best[r][c][x]'), row: 0, col: 0, reach: 0, message: `Start at the top-left cell with score 0 and cost 0. Budget k = ${k}.` }]
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (r === 0 && c === 0) continue
      const add = grid[r][c] > 0 ? 1 : 0
      const sources = []
      if (r > 0) sources.push(best[r - 1][c])
      if (c > 0) sources.push(best[r][c - 1])
      for (const src of sources) {
        for (let x = 0; x + add <= k; x++) {
          if (src[x] === NEG) continue
          best[r][c][x + add] = Math.max(best[r][c][x + add], src[x] + grid[r][c])
        }
      }
      const reach = Math.max(...best[r][c])
      frames.push({ phase: 'cell', activeLine: L('for each cost x'), row: r, col: c, reach: reach === NEG ? -1 : reach, message: `Cell (${r}, ${c}) holds ${grid[r][c]}. Best score reaching it within budget: ${reach === NEG ? 'none' : reach}.` })
    }
  }
  const finalBest = Math.max(...best[m - 1][n - 1])
  const result = finalBest === NEG ? -1 : finalBest
  frames.push({ phase: 'done', activeLine: L('return the best value'), row: m - 1, col: n - 1, reach: result, message: `Answer: ${result}.` })
  return { input, result, frames }
}

export const code = `maximum path score within cost k:
  set best[r][c][x] to minus infinity for all cells and costs
  set best[0][0][0] to 0
  for each cell (r, c) in row order, skipping the start:
    set add to 1 if the cell is 1 or 2, otherwise 0
    for each cell above or to the left as a source:
      for each cost x from 0 while x + add is at most k:
        if best[source][x] is set then
          update best[r][c][x + add] with best[source][x] plus the cell value
  return the best value at the bottom-right over all costs, or -1 if none`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_path_score(grid, k):
    NEG = float('-inf')
    m, n = len(grid), len(grid[0])
    best = [[[NEG] * (k + 1) for _ in range(n)] for _ in range(m)]
    best[0][0][0] = 0
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                continue
            add = 1 if grid[r][c] > 0 else 0
            sources = []
            if r > 0:
                sources.append(best[r - 1][c])
            if c > 0:
                sources.append(best[r][c - 1])
            for src in sources:
                for x in range(0, k + 1 - add):
                    if src[x] == NEG:
                        continue
                    best[r][c][x + add] = max(best[r][c][x + add], src[x] + grid[r][c])
    final = max(best[m - 1][n - 1])
    return -1 if final == NEG else final
`
