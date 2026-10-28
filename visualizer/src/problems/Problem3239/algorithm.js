export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid array.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 6) throw new Error('grid must be at most 6 by 6.')
  const n = grid[0].length
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => v !== 0 && v !== 1))) throw new Error('grid must be rectangular, with only 0 and 1 values.')
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const rows = grid.length
  const cols = grid[0].length
  const frames = [{ phase: 'start', activeLine: L('set row flips to 0'), pair: null, rowFlips: 0, colFlips: 0, message: 'Make every row a palindrome, or every column a palindrome, whichever is cheaper.' }]
  let rowFlips = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < Math.floor(cols / 2); c++) {
      const mirror = cols - 1 - c
      const mismatch = grid[r][c] !== grid[r][mirror]
      if (mismatch) rowFlips += 1
      frames.push({ phase: 'row', activeLine: L('if the cell differs from its mirror in the same row'), pair: [[r, c], [r, mirror]], mismatch, rowFlips, colFlips: 0, message: mismatch ? `Row ${r}: (${r}, ${c}) and (${r}, ${mirror}) differ. Row flips: ${rowFlips}.` : `Row ${r}: (${r}, ${c}) and (${r}, ${mirror}) match.` })
    }
  }
  let colFlips = 0
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < Math.floor(rows / 2); r++) {
      const mirror = rows - 1 - r
      const mismatch = grid[r][c] !== grid[mirror][c]
      if (mismatch) colFlips += 1
      frames.push({ phase: 'column', activeLine: L('if the cell differs from its mirror in the same column'), pair: [[r, c], [mirror, c]], mismatch, rowFlips, colFlips, message: mismatch ? `Column ${c}: (${r}, ${c}) and (${mirror}, ${c}) differ. Column flips: ${colFlips}.` : `Column ${c}: (${r}, ${c}) and (${mirror}, ${c}) match.` })
    }
  }
  const result = Math.min(rowFlips, colFlips)
  frames.push({ phase: 'done', activeLine: L('return the smaller'), pair: null, rowFlips, colFlips, message: `Rows need ${rowFlips} flips and columns need ${colFlips}. The answer is ${result}.` })
  return { input, result, frames }
}

export const code = `minimum flips to make grid palindromic (grid):
  set row flips to 0
  for each row
    for each column in the left half
      if the cell differs from its mirror in the same row then
        add one to row flips
  set column flips to 0
  for each column
    for each row in the top half
      if the cell differs from its mirror in the same column then
        add one to column flips
  return the smaller of row flips and column flips`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_flips(grid):
    rows, cols = len(grid), len(grid[0])
    row_flips = 0
    for r in range(rows):
        for c in range(cols // 2):
            if grid[r][c] != grid[r][cols - 1 - c]:
                row_flips += 1
    col_flips = 0
    for c in range(cols):
        for r in range(rows // 2):
            if grid[r][c] != grid[rows - 1 - r][c]:
                col_flips += 1
    return min(row_flips, col_flips)
`
