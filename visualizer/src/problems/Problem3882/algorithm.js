export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.grid)) throw new Error('Use a JSON object with a "grid" array of rows.')
  const { grid } = obj
  if (grid.length < 1 || grid.length > 6) throw new Error('grid must have 1 to 6 rows for this visualization.')
  if (grid.some(row => !Array.isArray(row) || row.length < 1)) throw new Error('Every row must be a non-empty array.')
  const width = grid[0].length
  if (grid.some(row => row.length !== width)) throw new Error('Every row must have the same length.')
  if (grid.length * width > 30) throw new Error('grid may have at most 30 cells for this visualization.')
  if (grid.some(row => row.some(v => !Number.isInteger(v) || v < 0 || v > 1023))) throw new Error('Each value must be an integer from 0 to 1023.')
  return { grid }
}

export function buildTrace({ grid }) {
  const m = grid.length
  const n = grid[0].length
  const reach = Array.from({ length: m }, () => Array.from({ length: n }, () => new Set()))
  const frames = [{ phase: 'start', activeLine: L('set m to'), cell: null, values: [], result: null, message: `A ${m} by ${n} grid. Track every XOR value that reaches each cell.` }]
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (i === 0 && j === 0) {
        reach[i][j].add(grid[0][0])
        frames.push({ phase: 'cell', activeLine: L('add the start'), cell: [i, j], values: [...reach[i][j]], result: null, message: `Start cell: XOR values {${grid[0][0]}}.` })
        continue
      }
      const prev = new Set()
      if (i > 0) for (const x of reach[i - 1][j]) prev.add(x)
      if (j > 0) for (const x of reach[i][j - 1]) prev.add(x)
      for (const x of prev) reach[i][j].add(x ^ grid[i][j])
      frames.push({ phase: 'cell', activeLine: L('for each xor value'), cell: [i, j], values: [...reach[i][j]].sort((a, b) => a - b), result: null,
        message: `Cell (${i}, ${j}) has ${reach[i][j].size} reachable XOR value(s).` })
    }
  }
  const finals = [...reach[m - 1][n - 1]]
  const result = Math.min(...finals)
  frames.push({ phase: 'done', activeLine: L('return the smallest'), cell: [m - 1, n - 1], values: finals.sort((a, b) => a - b), result, message: `Smallest XOR at the bottom-right cell: ${result}.` })
  return { input: { grid }, result, frames }
}

export const code = `minimum xor path in a grid (grid):
  set m to the number of rows and n to the number of columns
  for each cell (i, j) in row-major order
    if the cell is the start then
      add the start value to reach[0][0]
    otherwise
      collect the XOR values from the cell above and the cell to the left
      for each xor value x collected, add x xor grid[i][j] to reach[i][j]
  return the smallest value in reach[m-1][n-1]

a smaller partial XOR can still lead to a larger final XOR, so every value is kept`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_xor_path(grid):
    m, n = len(grid), len(grid[0])
    reach = [[set() for _ in range(n)] for _ in range(m)]
    for i in range(m):
        for j in range(n):
            if i == 0 and j == 0:
                reach[i][j].add(grid[0][0])
                continue
            prev = set()
            if i > 0:
                prev |= reach[i - 1][j]
            if j > 0:
                prev |= reach[i][j - 1]
            for x in prev:
                reach[i][j].add(x ^ grid[i][j])
    return min(reach[m - 1][n - 1])
`
