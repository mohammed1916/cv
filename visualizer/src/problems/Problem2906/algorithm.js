const MOD = 12345

export function parseInput(text) {
  const input = JSON.parse(text)
  const grid = input?.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 4) throw new Error('grid has 1 to 4 rows.')
  const m = Array.isArray(grid[0]) ? grid[0].length : 0
  if (m < 1 || m > 4 || grid.length * m > 12) throw new Error('Use at most 12 cells with 1 to 4 columns.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== m) throw new Error('Every row must have the same length.')
    for (const v of row) if (!Number.isInteger(v) || v < 1 || v > 1e9) throw new Error('Cells are integers from 1 to 1000000000.')
  }
  return { grid }
}

export function buildTrace({ grid }) {
  const n = grid.length
  const m = grid[0].length
  const flat = grid.flat().map(v => v % MOD)
  const total = flat.length
  const frames = []
  const prefix = [1]
  frames.push({ pythonLine: P('MOD = 12345'), phase: 'start', activeLine: L('const flat = grid'), at: -1, row: -1, col: -1, matrix: null, message: `Flatten the ${n} by ${m} grid and reduce each value modulo 12345.` })
  for (let k = 0; k < total; k++) {
    prefix.push(prefix[k] * flat[k] % MOD)
    frames.push({ pythonLine: P('prefix[k + 1] = prefix[k] * flat[k] % MOD'), phase: 'prefix', activeLine: L('prefix.push'), at: k, row: -1, col: -1, matrix: null, message: `Product of cells 0 to ${k} is ${prefix[k + 1]}.` })
  }
  const result = Array.from({ length: n }, () => Array(m).fill(0))
  let suffix = 1
  for (let k = total - 1; k >= 0; k--) {
    const i = Math.floor(k / m)
    const j = k % m
    result[i][j] = prefix[k] * suffix % MOD
    frames.push({ pythonLine: P('result[i][j] = prefix[k] * suffix % MOD'), phase: 'suffix', activeLine: L('result[k] = prefix[k]'), at: k, row: i, col: j, matrix: result.map(r => [...r]), message: `Cell ${i},${j} gets the product of the cells before it and after it: ${result[i][j]}.` })
    suffix = suffix * flat[k] % MOD
  }
  frames.push({ pythonLine: P('return result'), phase: 'done', activeLine: L('return rows of result'), at: -1, row: -1, col: -1, matrix: result.map(r => [...r]), message: 'Every cell now holds the product of all other cells.' })
  return { input: { grid }, result, frames }
}

export const code = `const MOD = 12345
const flat = grid.flat().map(v => v % MOD)
const prefix = [1]
for (let k = 0; k < flat.length; k++) prefix.push(prefix[k] * flat[k] % MOD)
let suffix = 1
const result = Array(flat.length)
for (let k = flat.length - 1; k >= 0; k--) {
  result[k] = prefix[k] * suffix % MOD
  suffix = suffix * flat[k] % MOD
}
return rows of result, same shape as grid`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def construct_product_matrix(grid):
    MOD = 12345
    n, m = len(grid), len(grid[0])
    flat = [grid[i][j] % MOD for i in range(n) for j in range(m)]
    total = len(flat)
    prefix = [1] * (total + 1)
    for k in range(total):
        prefix[k + 1] = prefix[k] * flat[k] % MOD
    suffix = 1
    result = [[0] * m for _ in range(n)]
    for k in range(total - 1, -1, -1):
        i, j = divmod(k, m)
        result[i][j] = prefix[k] * suffix % MOD
        suffix = suffix * flat[k] % MOD
    return result
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
