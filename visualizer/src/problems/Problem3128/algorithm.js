export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('Use a grid of 1 to 6 rows.')
  const width = Array.isArray(grid[0]) ? grid[0].length : 0
  if (width < 1 || width > 6) throw new Error('Each row has 1 to 6 cells.')
  if (grid.some(row => !Array.isArray(row) || row.length !== width || row.some(v => v !== 0 && v !== 1))) throw new Error('Every row must have the same length and hold only 0 or 1.')
  return grid
}

export function buildTrace(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const rowOnes = grid.map(row => row.reduce((a, b) => a + b, 0))
  const colOnes = Array.from({ length: cols }, (_, c) => grid.reduce((a, row) => a + row[c], 0))
  const frames = [{ phase: 'start', activeLine: L('set rowCount to'), cell: null, state: { total: 0 }, message: 'Count the 1s in every row and column. A 1 that is a right-angle corner pairs with another 1 in its row and another in its column.' }]
  let total = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue
      const added = (rowOnes[r] - 1) * (colOnes[c] - 1)
      total += added
      frames.push({ phase: 'corner', activeLine: L('add (rowCount of its row minus 1)'), cell: [r, c], state: { corner: `[${r}, ${c}]`, row: rowOnes[r], column: colOnes[c], added, total }, message: `Corner [${r}, ${c}] has ${rowOnes[r] - 1} other 1s in its row and ${colOnes[c] - 1} in its column, adding ${added}. Total ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), cell: null, state: { total }, message: `Return ${total}.` })
  return { input: grid, result: total, matrix: grid, rowOnes, colOnes, frames }
}

export const code = `count right triangles with a corner at a 1
  set rowCount to the number of 1s in each row
  set colCount to the number of 1s in each column
  set total to 0
  for each cell that holds 1
    add (rowCount of its row minus 1) times (colCount of its column minus 1) to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_right_triangles(grid):
    rows = [sum(row) for row in grid]
    cols = [sum(grid[r][c] for r in range(len(grid))) for c in range(len(grid[0]))]
    total = 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == 1:
                total += (rows[r] - 1) * (cols[c] - 1)
    return total
`
