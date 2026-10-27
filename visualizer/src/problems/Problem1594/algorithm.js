const MAX_SIZE = 6
const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const grid = data?.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIZE) throw new Error(`grid must have 1 to ${MAX_SIZE} rows.`)
  const cols = Array.isArray(grid[0]) ? grid[0].length : 0
  if (cols < 1 || cols > MAX_SIZE) throw new Error(`Each row must have 1 to ${MAX_SIZE} cells.`)
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== cols) throw new Error('Every row must have the same number of cells.')
    if (row.some(v => !Number.isInteger(v) || v < -4 || v > 4)) throw new Error('Cell values are integers from -4 to 4.')
  }
  return { grid }
}

export const code = `max product path(grid):
  set big and small to empty tables of the largest and smallest products reaching each cell
  set both products at the top-left cell to its value
  for each other cell in row-major order:
    collect the products of this value with the largest and smallest products from the cell above and from the cell to the left
    set big to the greatest collected product and small to the least
  if big at the bottom-right is negative return -1
  return big at the bottom-right mod 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ grid }) {
  const m = grid.length
  const n = grid[0].length
  const big = Array.from({ length: m }, () => Array(n).fill(null))
  const small = Array.from({ length: m }, () => Array(n).fill(null))
  big[0][0] = grid[0][0]
  small[0][0] = grid[0][0]
  const frames = [{ phase: 'start', activeLine: L('set both products'), row: 0, col: 0, big: big.map(r => [...r]), small: small.map(r => [...r]), message: `Top-left cell holds ${grid[0][0]}, so its only product is ${grid[0][0]}.` }]
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (r === 0 && c === 0) continue
      const v = grid[r][c]
      const candidates = []
      if (r > 0) candidates.push(big[r - 1][c] * v, small[r - 1][c] * v)
      if (c > 0) candidates.push(big[r][c - 1] * v, small[r][c - 1] * v)
      big[r][c] = Math.max(...candidates)
      small[r][c] = Math.min(...candidates)
      frames.push({ phase: 'cell', activeLine: L('collect the products'), row: r, col: c, big: big.map(row => [...row]), small: small.map(row => [...row]), message: `Cell (${r}, ${c}) with value ${v}: largest product ${big[r][c]}, smallest ${small[r][c]}.` })
    }
  }
  const end = big[m - 1][n - 1]
  const result = end < 0 ? -1 : (end % MOD) + 0
  frames.push({ phase: 'done', activeLine: L('return big at'), row: m - 1, col: n - 1, big: big.map(r => [...r]), small: small.map(r => [...r]), message: result === -1 ? 'Every path ends with a negative product.' : `Maximum non-negative product: ${result}.` })
  return { input: { grid }, grid, result, frames }
}

export const python = `def max_product_path(grid):
    MOD = 10**9 + 7
    m, n = len(grid), len(grid[0])
    big = [[0] * n for _ in range(m)]
    small = [[0] * n for _ in range(m)]
    big[0][0] = small[0][0] = grid[0][0]
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                continue
            v = grid[r][c]
            candidates = []
            if r > 0:
                candidates += [big[r - 1][c] * v, small[r - 1][c] * v]
            if c > 0:
                candidates += [big[r][c - 1] * v, small[r][c - 1] * v]
            big[r][c] = max(candidates)
            small[r][c] = min(candidates)
    best = big[m - 1][n - 1]
    return -1 if best < 0 else best % MOD
`
