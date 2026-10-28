export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.grid) || input.grid.length < 1 || input.grid.length > 6) throw new Error('Use {"grid": [...]} with 1 to 6 rows.')
  const width = input.grid[0].length
  if (!Array.isArray(input.grid[0]) || width < 1 || width > 6) throw new Error('Each row has 1 to 6 values.')
  if (input.grid.some(row => !Array.isArray(row) || row.length !== width)) throw new Error('The grid must be rectangular.')
  if (input.grid.flat().some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Cell values are integers from 1 to 100.')
  return { grid: input.grid }
}

export function buildTrace({ grid }) {
  const order = []
  grid.forEach((row, r) => {
    const cols = row.map((_, c) => c)
    if (r % 2 === 1) cols.reverse()
    for (const c of cols) order.push([r, c])
  })
  const kept = []
  const frames = [{ phase: 'start', activeLine: L('set the position counter to zero'), index: null, cell: null, kept: [], message: 'Walk row 0 left to right, then row 1 right to left, and so on.' }]
  order.forEach(([r, c], index) => {
    const keep = index % 2 === 0
    if (keep) kept.push(grid[r][c])
    frames.push({ phase: keep ? 'keep' : 'skip', activeLine: L(keep ? 'keep this cell' : 'skip this cell'), index, cell: [r, c], kept: [...kept], message: `Position ${index} holds ${grid[r][c]} and is ${keep ? 'kept' : 'skipped'}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the kept values'), index: null, cell: null, kept: [...kept], message: `Kept values: ${kept.join(', ')}.` })
  return { input: { grid }, order, result: kept, frames }
}

export const code = `zigzag traversal that keeps every other cell
  set the position counter to zero
  for each row from top to bottom
    walk the row left to right on even rows and right to left on odd rows
    for each cell in that walk
      if the position counter is even then
        keep this cell
      otherwise
        skip this cell
      add one to the position counter
  return the kept values in order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def zigzag_skip(grid):
    result = []
    position = 0
    for r, row in enumerate(grid):
        columns = range(len(row)) if r % 2 == 0 else range(len(row) - 1, -1, -1)
        for c in columns:
            if position % 2 == 0:
                result.append(row[c])
            position += 1
    return result
`
