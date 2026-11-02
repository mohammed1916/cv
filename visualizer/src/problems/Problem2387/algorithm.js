const CODE = [
  'FUNCTION median(matrix)',
  '    total ← rows × cols ; need ← (total + 1) / 2',
  '    lo ← smallest first value of any row, hi ← largest last value of any row',
  '    WHILE lo < hi',
  '        mid ← (lo + hi) / 2 rounded down',
  '        count ← number of values ≤ mid, counted row by row',
  '        IF count ≥ need THEN hi ← mid ELSE lo ← mid + 1',
  '    RETURN lo',
]

const PY = [
  'from bisect import bisect_right',
  'def median(grid):',
  '    total = len(grid) * len(grid[0])',
  '    need = (total + 1) // 2',
  '    lo = min(row[0] for row in grid)',
  '    hi = max(row[-1] for row in grid)',
  '    while lo < hi:',
  '        mid = (lo + hi) // 2',
  '        count = sum(bisect_right(row, mid) for row in grid)',
  '        if count >= need:',
  '            hi = mid',
  '        else:',
  '            lo = mid + 1',
  '    return lo',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Range', description: 'Find the smallest and largest possible answer.' },
  { id: 'probe', label: 'Probe', description: 'Try the middle value of the range.' },
  { id: 'count', label: 'Count', description: 'Count the values at most mid, row by row.' },
  { id: 'decide', label: 'Decide', description: 'Keep the half that still holds the median.' },
  { id: 'done', label: 'Result', description: 'The range has collapsed to the median.' },
]

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('The matrix has 1 to 6 rows in this visualization.')
  const n = grid[0]?.length
  if (!Array.isArray(grid[0]) || n < 1 || n > 6) throw new Error('Each row has 1 to 6 values in this visualization.')
  if (!grid.every(row => Array.isArray(row) && row.length === n)) throw new Error('Every row must have the same length.')
  if ((grid.length * n) % 2 === 0) throw new Error('The total number of elements must be odd.')
  if (!grid.flat().every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Values are integers from 1 to 100 in this visualization.')
  if (!grid.every(row => row.every((v, i) => i === 0 || row[i - 1] <= v))) throw new Error('Each row must be sorted in non-decreasing order.')
  return grid
}

// Number of values in a sorted row that are at most x (upper bound).
function countAtMost(row, x) {
  let lo = 0, hi = row.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (row[mid] <= x) lo = mid + 1
    else hi = mid
  }
  return lo
}

export function buildTrace(grid) {
  const m = grid.length
  const total = m * grid[0].length
  const need = (total + 1) / 2
  let lo = Math.min(...grid.map(row => row[0]))
  let hi = Math.max(...grid.map(row => row[row.length - 1]))
  const frames = []
  const base = (extra) => ({ lo, hi, need, ...extra })
  frames.push({ pythonLine: pyLine('lo = min(row[0] for row in grid)'), phase: 'start', activeLine: codeLine('lo ← smallest first value of any row, hi ← largest last value of any row'), mid: null, perRow: [], count: null, lo, hi, need, rows: grid, message: `Total ${total} values, so the median is the ${need}th smallest. The answer lies between ${lo} and ${hi}.` })
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    frames.push(base({ pythonLine: pyLine('mid = (lo + hi) // 2'), phase: 'probe', activeLine: codeLine('mid ← (lo + hi) / 2 rounded down'), mid, perRow: [], count: null, rows: grid, message: `Try mid = ${mid}.` }))
    const perRow = []
    for (const row of grid) {
      perRow.push(countAtMost(row, mid))
      frames.push(base({ pythonLine: pyLine('count = sum(bisect_right(row, mid) for row in grid)'), phase: 'count', activeLine: codeLine('count ← number of values ≤ mid, counted row by row'), mid, perRow: [...perRow], count: null, rows: grid, message: `This row has ${perRow[perRow.length - 1]} value${perRow[perRow.length - 1] === 1 ? '' : 's'} at most ${mid}.` }))
    }
    const count = perRow.reduce((a, b) => a + b, 0)
    if (count >= need) {
      hi = mid
      frames.push(base({ pythonLine: pyLine('hi = mid'), phase: 'decide', activeLine: codeLine('IF count ≥ need THEN hi ← mid ELSE lo ← mid + 1'), mid, perRow, count, rows: grid, message: `${count} values are at most ${mid}, which reaches ${need}. The median is at most ${mid}.` }))
    } else {
      lo = mid + 1
      frames.push(base({ pythonLine: pyLine('lo = mid + 1'), phase: 'decide', activeLine: codeLine('IF count ≥ need THEN hi ← mid ELSE lo ← mid + 1'), mid, perRow, count, rows: grid, message: `${count} values are at most ${mid}, short of ${need}. The median is above ${mid}.` }))
    }
  }
  frames.push(base({ pythonLine: pyLine('return lo'), phase: 'done', activeLine: codeLine('RETURN lo'), mid: null, perRow: [], count: null, rows: grid, message: `The range has collapsed. The median is ${lo}.` }))
  return { input: grid, result: lo, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
