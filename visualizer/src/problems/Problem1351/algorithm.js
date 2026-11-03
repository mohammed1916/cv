// Teaching model written for this visualizer. The sample grids and wording are original.
export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the bottom-left cell.' },
  { id: 'negative', label: 'Negative', description: 'A negative cell means every cell to its right in this row is negative too.' },
  { id: 'positive', label: 'Move right', description: 'A non-negative cell means nothing above it in this column is negative.' },
  { id: 'done', label: 'Result', description: 'The counted cells are the negative cells.' },
]

const CODE = [
  'count negatives(grid):',
  '  r = last row, c = 0, count = 0',
  '  while r >= 0 and c < width:',
  '    if grid[r][c] is negative:',
  '      count += width - c',
  '      r -= 1',
  '    else:',
  '      c += 1',
  '  return count',
]
const PYTHON = `def count_negatives(grid):
    rows, cols = len(grid), len(grid[0])
    r, c, count = rows - 1, 0, 0
    while r >= 0 and c < cols:
        if grid[r][c] < 0:
            count += cols - c
            r -= 1
        else:
            c += 1
    return count`
const PY = PYTHON.split('\n')
const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing solver line: ${text}`)
  return index + 1
}
const L = text => at(CODE, text)
const P = text => at(PY, text)

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8 || !grid.every(Array.isArray)) throw new Error('Enter a JSON array of 1 to 8 rows.')
  const width = grid[0].length
  if (width < 1 || width > 8 || grid.some(row => row.length !== width)) throw new Error('Every row needs the same length, from 1 to 8 values.')
  if (grid.flat().some(v => !Number.isInteger(v) || v < -100 || v > 100)) throw new Error('Use whole numbers from -100 to 100.')
  grid.forEach((row, r) => row.forEach((v, c) => {
    if (c > 0 && row[c - 1] < v) throw new Error(`Row ${r + 1} must not increase from left to right.`)
    if (r > 0 && grid[r - 1][c] < v) throw new Error(`Column ${c + 1} must not increase from top to bottom.`)
  }))
  return grid
}

export function buildTrace(grid) {
  const rows = grid.length, width = grid[0].length
  let r = rows - 1, c = 0, count = 0
  const counted = []
  const frames = []
  const snap = (focus = null) => ({ grid, r, c, count, counted: counted.map(cell => [...cell]), focus })

  frames.push({
    phase: 'start', activeLine: L('r = last row'), pythonLine: P('r, c, count ='),
    message: `Start at row ${rows}, column 1, the bottom-left cell. Rows and columns both decrease in one direction, so this walk visits each boundary once.`,
    snapshot: snap(),
  })
  while (r >= 0 && c < width) {
    if (grid[r][c] < 0) {
      const add = width - c
      for (let j = c; j < width; j++) counted.push([r, j])
      count += add
      frames.push({
        phase: 'negative', activeLine: L('count += width - c'), pythonLine: P('count +='),
        message: `Cell (${r + 1}, ${c + 1}) holds ${grid[r][c]}, which is negative. The rest of this row is negative too, so ${add} cell${add === 1 ? '' : 's'} are counted, and the walk moves up.`,
        snapshot: snap([r, c]),
      })
      r -= 1
    } else {
      frames.push({
        phase: 'positive', activeLine: L('c += 1'), pythonLine: P('c += 1'),
        message: `Cell (${r + 1}, ${c + 1}) holds ${grid[r][c]}, which is not negative. Every cell above it in this column is at least as large, so none is negative. The walk moves right.`,
        snapshot: snap([r, c]),
      })
      c += 1
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return count'), pythonLine: P('return count'),
    message: `The walk has left the grid, and ${count} negative cell${count === 1 ? '' : 's'} were counted.`,
    snapshot: snap(),
  })
  return { input: grid, result: count, frames }
}
