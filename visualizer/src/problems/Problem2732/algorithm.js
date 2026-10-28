export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.grid)) throw new Error('Use a JSON object with a grid array of rows.')
  const { grid } = obj
  if (grid.length < 1 || grid.length > 6) throw new Error('grid must have 1 to 6 rows (visualization cap).')
  const width = Array.isArray(grid[0]) ? grid[0].length : 0
  if (width < 1 || width > 5) throw new Error('Each row has 1 to 5 columns.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== width) throw new Error('Every row must have the same length.')
    if (row.some(v => v !== 0 && v !== 1)) throw new Error('Entries are 0 or 1.')
  }
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const m = grid.length
  const frames = [{ phase: 'start', activeLine: L('good subset of rows'), rows: [], message: 'Look for one all-zero row first, then for two rows with no shared column.' }]
  for (let i = 0; i < m; i++) {
    frames.push({ phase: 'zero', activeLine: L('if row i is all zeros'), rows: [i], message: `Check row ${i}.` })
    if (grid[i].every(v => v === 0)) {
      frames.push({ phase: 'done', activeLine: L('return [i]'), rows: [i], message: `Row ${i} is all zeros, so [${i}] is good.` })
      return { input, grid, result: [i], frames }
    }
  }
  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < m; j++) {
      const disjoint = grid[i].every((v, c) => v * grid[j][c] === 0)
      frames.push({ phase: 'pair', activeLine: L('if rows i and j have no column'), rows: [i, j], message: `Rows ${i} and ${j} ${disjoint ? 'share no column' : 'share a column'}.` })
      if (disjoint) {
        frames.push({ phase: 'done', activeLine: L('return [i, j]'), rows: [i, j], message: `Rows ${i} and ${j} form a good subset.` })
        return { input, grid, result: [i, j], frames }
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return []'), rows: [], message: 'No good subset exists.' })
  return { input, grid, result: [], frames }
}

export const code = `good subset of rows for the matrix grid
  for each row i do
    if row i is all zeros then
      return [i]
  for each pair of rows i < j do
    if rows i and j have no column in common then
      return [i, j]
  return []`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def good_subset(grid):
    m = len(grid)
    for i in range(m):
        if all(v == 0 for v in grid[i]):
            return [i]
    for i in range(m):
        for j in range(i + 1, m):
            if all(a * b == 0 for a, b in zip(grid[i], grid[j])):
                return [i, j]
    return []
`
