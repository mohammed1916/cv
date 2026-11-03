export const code = `the largest number of columns that can be kept in order
  set best to 0
  for each column j from 0 to the last column
    set length at j to 1
    for each earlier column i from 0 to j minus 1
      if every row differs by at most limit between column i and column j
        if length at i plus 1 is larger than length at j then set length at j to length at i plus 1
    if length at j is larger than best then set best to length at j
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def max_consistent_columns(grid, limit):
    rows = len(grid)
    cols = len(grid[0])
    length = [0] * cols
    best = 0
    for j in range(cols):
        length[j] = 1
        for i in range(j):
            if all(abs(grid[r][i] - grid[r][j]) <= limit for r in range(rows)):
                length[j] = max(length[j], length[i] + 1)
        best = max(best, length[j])
    return best
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.grid) || !Number.isInteger(input.limit)) {
    throw new Error('Use an object with grid (array of rows) and integer limit.')
  }
  const { grid, limit } = input
  if (grid.length < 1 || grid.length > 5) throw new Error('grid has 1 to 5 rows in this visualization.')
  const width = grid[0].length
  if (width < 1 || width > 8) throw new Error('grid has 1 to 8 columns in this visualization.')
  if (!grid.every(row => Array.isArray(row) && row.length === width && row.every(v => Number.isInteger(v) && v >= -20 && v <= 20))) {
    throw new Error('Every row must have the same length, with integers from -20 to 20.')
  }
  if (limit < 0 || limit > 20) throw new Error('limit is an integer from 0 to 20 in this visualization.')
  return { grid, limit }
}

export function buildTrace({ grid, limit }) {
  const rows = grid.length
  const cols = grid[0].length
  const frames = []
  const length = Array(cols).fill(0)
  let best = 0
  frames.push({ pythonLine: P('rows = len(grid)'), phase: 'start', activeLine: L('set best to 0'), i: -1, j: -1, row: -1, ok: null, length: [...length], best, message: `Check ${cols} columns against limit ${limit}.` })
  for (let j = 0; j < cols; j++) {
    length[j] = 1
    frames.push({ pythonLine: P('length[j] = 1'), phase: 'column', activeLine: L('set length at j to 1'), i: -1, j, row: -1, ok: null, length: [...length], best, message: `Column ${j} can always stand alone.` })
    for (let i = 0; i < j; i++) {
      let failRow = -1
      for (let r = 0; r < rows; r++) {
        if (Math.abs(grid[r][i] - grid[r][j]) > limit) { failRow = r; break }
      }
      const ok = failRow === -1
      if (ok && length[i] + 1 > length[j]) length[j] = length[i] + 1
      frames.push({ pythonLine: P('if all(abs'), phase: 'pair', activeLine: L('if every row differs'), i, j, row: failRow, ok, length: [...length], best,
        message: ok ? `Columns ${i} and ${j} are compatible in every row; length at ${j} is ${length[j]}.` : `Row ${failRow} differs by more than ${limit} between columns ${i} and ${j}.` })
    }
    if (length[j] > best) best = length[j]
    frames.push({ pythonLine: P('best = max(best'), phase: 'record', activeLine: L('if length at j is larger than best'), i: -1, j, row: -1, ok: null, length: [...length], best, message: `Best kept run is ${best}.` })
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), i: -1, j: -1, row: -1, ok: null, length: [...length], best, message: `At most ${best} column${best === 1 ? '' : 's'} can be kept.` })
  return { input: { grid, limit }, result: best, frames }
}
