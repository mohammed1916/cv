export function parseInput(text) {
  const matrix = JSON.parse(text)
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 8) throw new Error('Use a list of 1 to 8 rows.')
  const cols = Array.isArray(matrix[0]) ? matrix[0].length : 0
  if (cols < 1 || cols > 8) throw new Error('Each row has 1 to 8 columns.')
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== cols) throw new Error('Every row must have the same length.')
    if (!row.every(v => v === 0 || v === 1)) throw new Error('Cells hold only 0 or 1.')
    for (let j = 1; j < cols; j++) {
      if (row[j] < row[j - 1]) throw new Error('Each row must be sorted in nondecreasing order.')
    }
  }
  return { matrix }
}

export function buildTrace({ matrix }) {
  const rows = matrix.length
  const cols = matrix[0].length
  const probes = []
  const frames = []
  let row = 0
  let col = cols - 1
  let best = -1
  const push = frame => frames.push({ rows, cols, row, col, best, probes: probes.slice(), ...frame })

  push({ pythonLine: 2, phase: 'start', activeLine: L('read rows and cols'), message: `The grid is ${rows} row${rows === 1 ? '' : 's'} by ${cols} column${cols === 1 ? '' : 's'}. Every cell is read through get.` })
  push({ pythonLine: 4, phase: 'init', activeLine: L('start at the top-right corner'), message: `Start at the top-right corner, row 0 and column ${col}.` })
  while (true) {
    const inside = row < rows && col >= 0
    push({ pythonLine: 6, phase: 'check', activeLine: L('while row is inside'), message: inside ? `Row ${row} and column ${col} are still on the grid.` : 'The cursor has left the grid.' })
    if (!inside) break
    const value = matrix[row][col]
    probes.push({ row, col, value })
    push({ pythonLine: 7, phase: 'probe', activeLine: L('if get(row, col) equals 1'), message: `get(${row}, ${col}) returns ${value}.` })
    if (value === 1) {
      best = col
      push({ pythonLine: 8, phase: 'hit', activeLine: L('set best to col'), message: `A 1 at column ${col}. Column ${col} is a candidate, so look for an earlier one to the left.` })
      col -= 1
      push({ pythonLine: 9, phase: 'left', activeLine: L('move col left'), message: `Move the cursor to column ${col}, staying in row ${row}.` })
    } else {
      row += 1
      push({ pythonLine: 11, phase: 'down', activeLine: L('move row down'), message: `A 0 at column ${col}. Since the row is sorted, nothing at or left of column ${col} is a 1 here, so move down to row ${row}.` })
    }
  }
  push({ pythonLine: 12, phase: 'done', activeLine: L('return best'), message: best === -1 ? `The walk ends with ${probes.length} get calls and no 1 was found, so the answer is -1.` : `The walk ends after ${probes.length} get calls. The leftmost column with a 1 is ${best}.` })
  return { input: { matrix }, result: best, frames }
}

export const code = `leftmost column with a 1 in a row-sorted binary matrix
  read rows and cols from the dimensions
  set row to 0 and best to minus 1
  start at the top-right corner, where col is cols minus 1
  while row is inside the grid and col is at least 0
    if get(row, col) equals 1
      set best to col
      move col left by one
    else
      move row down by one
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

function L(s) {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def leftmost_column_with_one(binary_matrix):
    rows, cols = binary_matrix.dimensions()
    row = 0
    col = cols - 1
    best = -1
    while row < rows and col >= 0:
        if binary_matrix.get(row, col) == 1:
            best = col
            col -= 1
        else:
            row += 1
    return best
`
