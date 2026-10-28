export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a square grid array.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6 || grid.some(row => !Array.isArray(row) || row.length !== grid.length)) throw new Error('grid must be square, at most 6 by 6.')
  if (grid.some(row => row.some(v => !Number.isInteger(v) || v < 1 || v > 100))) throw new Error('grid values are integers from 1 to 100.')
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const n = grid.length
  const columns = new Map()
  for (let c = 0; c < n; c++) {
    const key = JSON.stringify(grid.map(row => row[c]))
    columns.set(key, (columns.get(key) ?? 0) + 1)
  }
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('build a count of each column'), row: -1, matched: 0, total, message: `Read each column top to bottom and count the copies of each one.` }]
  for (let r = 0; r < n; r++) {
    const matched = columns.get(JSON.stringify(grid[r])) ?? 0
    total += matched
    frames.push({ phase: 'row', activeLine: L('look up how many columns'), row: r, matched, total, message: `Row ${r} equals ${matched} column${matched === 1 ? '' : 's'}. Total: ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), row: -1, matched: 0, total, message: `${total} equal row and column pairs.` })
  return { input, result: total, frames }
}

export const code = `count equal row and column pairs (grid):
  build a count of each column, read top to bottom
  set total to 0
  for each row
    look up how many columns equal this row
    add that count to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def equal_pairs(grid):
    n = len(grid)
    columns = {}
    for c in range(n):
        key = tuple(grid[r][c] for r in range(n))
        columns[key] = columns.get(key, 0) + 1
    total = 0
    for r in range(n):
        total += columns.get(tuple(grid[r]), 0)
    return total
`
