// LeetCode 2128: Remove All Ones With Row and Column Flips.
// Flipping a row or column complements it. Normalise each row by XOR-ing it with its first bit:
// rows that are equal or complementary share a normalised shape, and that shape is exactly the
// condition under which whole-row and whole-column flips can clear the grid.

const MAX_SIDE = 6

export function parseInput(text) {
  let grid
  try { grid = JSON.parse(text) } catch { throw new Error('Use a JSON array of 0/1 rows, e.g. [[1,0],[0,1]].') }
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIDE) throw new Error(`Use 1 to ${MAX_SIDE} rows. The visualization caps the grid at ${MAX_SIDE} x ${MAX_SIDE}.`)
  const cols = grid[0]?.length
  if (!cols || cols > MAX_SIDE || grid.some(row => !Array.isArray(row) || row.length !== cols || row.some(v => v !== 0 && v !== 1))) {
    throw new Error(`Every row needs the same length, at most ${MAX_SIDE}, holding only 0 or 1.`)
  }
  return { grid }
}

export const code = `FUNCTION canRemoveAll(grid)
    pattern ← row 0 with every bit XOR-ed with its first bit
    FOR each row r of grid
        shape ← row r with every bit XOR-ed with its first bit
        IF shape differs from pattern THEN RETURN false
    RETURN true`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def can_remove_all(grid):
    def normalize(row):
        return tuple(bit ^ row[0] for bit in row)
    pattern = normalize(grid[0])
    for row in grid:
        if normalize(row) != pattern:
            return False
    return True
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Pattern', description: 'Normalise the first row.' },
  { id: 'row', label: 'Compare row', description: 'Normalise this row and compare.' },
  { id: 'mismatch', label: 'Mismatch', description: 'This row has a different shape.' },
  { id: 'done', label: 'Result', description: 'Report whether every row shares the shape.' },
]

const normalize = row => row.map(bit => bit ^ row[0])

export function buildTrace({ grid }) {
  const frames = []
  const pattern = normalize(grid[0])
  frames.push({ phase: 'start', activeLine: L('pattern ← row 0'), pythonLine: P('pattern = normalize(grid[0])'), message: `Row 0 normalised is ${pattern.join('')}.`, row: -1, shape: pattern, pattern, ok: null })
  let result = true
  for (let r = 0; r < grid.length; r++) {
    const shape = normalize(grid[r])
    const same = shape.join('') === pattern.join('')
    frames.push({ phase: same ? 'row' : 'mismatch', activeLine: L(same ? 'FOR each row r' : 'IF shape differs'), pythonLine: P(same ? 'for row in grid' : 'return False'), message: same ? `Row ${r} has the same shape (it equals row 0 or its complement).` : `Row ${r} normalises to ${shape.join('')}, not ${pattern.join('')}.`, row: r, shape, pattern, ok: same })
    if (!same) { result = false; break }
  }
  frames.push({ phase: 'done', activeLine: L('RETURN true'), pythonLine: P('return True'), message: result ? 'Every row is equal or complementary to row 0: the grid can be cleared.' : 'Some row cannot be matched by flips: the grid cannot be cleared.', row: -1, shape: pattern, pattern, ok: result })
  return { input: { grid }, result, frames }
}
