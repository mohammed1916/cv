export const phases = [
  { id: 'start', label: 'Start', description: 'Start with an all-zero grid and the full row and column demands.' },
  { id: 'compare', label: 'Compare demands', description: 'Take the smaller of the current row demand and column demand.' },
  { id: 'place', label: 'Place value', description: 'Write that amount into the current cell and subtract it from both demands.' },
  { id: 'advance', label: 'Advance', description: 'Move past whichever row or column is now satisfied.' },
  { id: 'done', label: 'Complete', description: 'Every row and column total is met, so the grid is returned.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"rows": [3, 4], "cols": [2, 5]}.')
  const { rows, cols } = input
  const valid = list => Array.isArray(list) && list.length >= 1 && list.length <= 8 && list.every(v => Number.isInteger(v) && v >= 0 && v <= 50)
  if (!valid(rows)) throw new Error('rows lists 1 to 8 integers from 0 to 50.')
  if (!valid(cols)) throw new Error('cols lists 1 to 8 integers from 0 to 50.')
  if (rows.reduce((a, b) => a + b, 0) !== cols.reduce((a, b) => a + b, 0)) throw new Error('The row sums and column sums must add up to the same total.')
  return { rows, cols }
}

export const code = [
  "function findValidMatrix(rows, cols) {",
  "  const rowLeft = [...rows], colLeft = [...cols];",
  "  const grid = rows.map(() => cols.map(() => 0));",
  "  let i = 0, j = 0;",
  "  while (i < rows.length && j < cols.length) {",
  "    const v = Math.min(rowLeft[i], colLeft[j]);",
  "    grid[i][j] = v;",
  "    rowLeft[i] -= v;",
  "    colLeft[j] -= v;",
  "    if (rowLeft[i] === 0) i++;",
  "    else j++;",
  "  }",
  "  return grid;",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def fill_matrix(rows, cols):
    row_left, col_left = list(rows), list(cols)
    grid = [[0] * len(cols) for _ in rows]
    i = j = 0
    while i < len(rows) and j < len(cols):
        v = min(row_left[i], col_left[j])
        grid[i][j] = v
        row_left[i] -= v
        col_left[j] -= v
        if row_left[i] == 0:
            i += 1
        else:
            j += 1
    return grid
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (phase, pseudo, py, message, snapshot) => ({ phase, activeLine: L(pseudo), pythonLine: P(py), message, snapshot })

export function buildTrace({ rows, cols }) {
  const rowLeft = [...rows]
  const colLeft = [...cols]
  const grid = rows.map(() => cols.map(() => 0))
  let i = 0
  let j = 0
  const snap = (placed) => ({ rowLeft: [...rowLeft], colLeft: [...colLeft], grid: grid.map(r => [...r]), i, j, placed })
  const total = rows.reduce((a, b) => a + b, 0)
  const frames = [at('start', 'const grid = rows.map', 'grid = [[0]', `Totals match at ${total}. Fill the grid from the top-left, one cell at a time.`, snap(null))]
  while (i < rows.length && j < cols.length) {
    const v = Math.min(rowLeft[i], colLeft[j])
    frames.push(at('compare', 'const v = Math.min', 'v = min', `Row ${i + 1} still needs ${rowLeft[i]} and column ${j + 1} still needs ${colLeft[j]}. The smaller is ${v}.`, snap(null)))
    grid[i][j] = v
    rowLeft[i] -= v
    colLeft[j] -= v
    frames.push(at('place', 'grid[i][j] = v', 'grid[i][j] = v', `Cell (${i + 1}, ${j + 1}) receives ${v}. Row ${i + 1} now needs ${rowLeft[i]}, column ${j + 1} needs ${colLeft[j]}.`, snap({ i, j, v })))
    if (rowLeft[i] === 0) {
      frames.push(at('advance', 'if (rowLeft[i] === 0)', 'i += 1', `Row ${i + 1} is satisfied, so move down to row ${i + 2}.`, snap({ i, j, v })))
      i += 1
    } else {
      frames.push(at('advance', 'else j++', 'j += 1', `Column ${j + 1} is satisfied, so move right to column ${j + 2}.`, snap({ i, j, v })))
      j += 1
    }
  }
  frames.push(at('done', 'return grid', 'return grid', 'Every row and column total is met, so the grid is the answer.', snap(null)))
  return { input: { rows, cols }, result: grid, frames }
}
