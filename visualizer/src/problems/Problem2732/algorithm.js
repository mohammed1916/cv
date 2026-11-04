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

// Rows are chosen as a subset. The subset is good when each column sum is at most floor(k / 2), where k is the subset size.
// Subsets are tried by size, then by row order, so the first good subset found is returned.
export function buildTrace(input) {
  const { grid } = input
  const m = grid.length
  const n = grid[0].length
  const frames = [{ phase: 'start', activeLine: L('try subsets of rows by size'), pythonLine: 2, rows: [], sums: [], limit: null, message: 'Try single rows first, then pairs, then larger subsets.' }]
  for (let size = 1; size <= m; size++) {
    const combo = []
    const walk = start => {
      if (combo.length === size) {
        const sums = Array.from({ length: n }, (_, c) => combo.reduce((total, r) => total + grid[r][c], 0))
        const limit = Math.floor(size / 2)
        const good = sums.every(s => s <= limit)
        frames.push({ phase: good ? 'good' : 'check', activeLine: L(good ? 'return the rows' : 'if every column sum is at most'), pythonLine: good ? 7 : 6, rows: [...combo], sums, limit,
          message: good ? `Rows ${combo.join(', ')} are good: every column sum is at most ${limit}.` : `Rows ${combo.join(', ')} fail: a column sum is ${Math.max(...sums)}, above ${limit}.` })
        return good ? [...combo] : null
      }
      for (let r = start; r < m; r++) {
        combo.push(r)
        const found = walk(r + 1)
        combo.pop()
        if (found) return found
      }
      return null
    }
    const found = walk(0)
    if (found) {
      frames.push({ phase: 'done', activeLine: L('return the rows'), pythonLine: 7, rows: found, sums: null, limit: null, message: `Return [${found.join(', ')}].` })
      return { input, grid, result: found, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return []'), pythonLine: 8, rows: [], sums: null, limit: null, message: 'No subset of rows is good.' })
  return { input, grid, result: [], frames }
}

export const code = `good subset of rows for the matrix grid
  for each size k from 1 to the number of rows do
    for each set of k rows in row order do
      find the column sums of the set
      if every column sum is at most floor(k / 2) then
        return the rows
  return []`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def good_subset(grid):
    m, n = len(grid), len(grid[0])
    for k in range(1, m + 1):
        for rows in combinations(range(m), k):
            sums = [sum(grid[r][c] for r in rows) for c in range(n)]
            if all(s <= k // 2 for s in sums):
                return list(rows)
    return []
`
