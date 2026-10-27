const MAX_SIZE = 5
const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const grid = data?.grid
  const k = data?.k
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIZE) throw new Error(`grid must have 1 to ${MAX_SIZE} rows.`)
  const n = Array.isArray(grid[0]) ? grid[0].length : 0
  if (n < 1 || n > MAX_SIZE) throw new Error(`Each row must have 1 to ${MAX_SIZE} cells.`)
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('Every row must have the same number of cells.')
    if (row.some(v => !Number.isInteger(v) || v < 0 || v > 15)) throw new Error('Cell values are integers from 0 to 15.')
  }
  if (!Number.isInteger(k) || k < 0 || k > 15) throw new Error('k must be an integer from 0 to 15.')
  return { grid, k }
}

export const code = `count paths with xor(grid, k):
  set ways to an empty table of XOR counts for every cell
  set the top-left cell to one path whose XOR is grid[0][0]
  for each cell in row-major order, except the top-left:
    for each XOR value x of the cell above and of the cell to the left:
      add its count to the cell's XOR value x xor this cell's value
  return the count with XOR value k at the bottom-right, mod 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ grid, k }) {
  const m = grid.length
  const n = grid[0].length
  const ways = Array.from({ length: m }, () => Array.from({ length: n }, () => Array(16).fill(0)))
  const done = Array.from({ length: m }, () => Array(n).fill(false))
  const view = () => ways.map((row, r) => row.map((counts, c) => (done[r][c] ? counts[k] : '·')))
  ways[0][0][grid[0][0]] = 1
  done[0][0] = true
  const frames = [{ phase: 'start', activeLine: L('set the top-left cell'), row: 0, col: 0, table: view(), message: `Top-left starts one path with XOR ${grid[0][0]}.` }]
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (r === 0 && c === 0) continue
      const v = grid[r][c]
      const sources = []
      if (r > 0) sources.push(ways[r - 1][c])
      if (c > 0) sources.push(ways[r][c - 1])
      for (const src of sources) {
        for (let x = 0; x < 16; x++) {
          if (src[x] === 0) continue
          const next = x ^ v
          ways[r][c][next] = (ways[r][c][next] + src[x]) % MOD
        }
      }
      done[r][c] = true
      frames.push({ phase: 'cell', activeLine: L('add its count to the cell'), row: r, col: c, table: view(), message: `Cell (${r}, ${c}): ${ways[r][c][k]} path(s) with XOR ${k} so far.` })
    }
  }
  const result = ways[m - 1][n - 1][k] % MOD
  frames.push({ phase: 'done', activeLine: L('return the count with XOR value k'), row: m - 1, col: n - 1, table: view(), message: `Paths with XOR ${k}: ${result}.` })
  return { input: { grid, k }, grid, k, result, frames }
}

export const python = `def count_paths_with_xor(grid, k):
    MOD = 1000000007
    m, n = len(grid), len(grid[0])
    ways = [[[0] * 16 for _ in range(n)] for _ in range(m)]
    ways[0][0][grid[0][0]] = 1
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                continue
            v = grid[r][c]
            sources = []
            if r > 0:
                sources.append(ways[r - 1][c])
            if c > 0:
                sources.append(ways[r][c - 1])
            for src in sources:
                for x in range(16):
                    if src[x]:
                        nxt = x ^ v
                        ways[r][c][nxt] = (ways[r][c][nxt] + src[x]) % MOD
    return ways[m - 1][n - 1][k] % MOD
`
