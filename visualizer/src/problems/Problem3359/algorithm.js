export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid and k.')
  const { grid, k } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('grid has 1 to 6 rows.')
  const cols = Array.isArray(grid[0]) ? grid[0].length : 0
  if (cols < 1 || cols > 6) throw new Error('Each row has 1 to 6 values.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== cols || !row.every(v => Number.isInteger(v) && v >= 0 && v <= 9)) {
      throw new Error('Every row has the same length, and each value is an integer from 0 to 9.')
    }
  }
  if (!Number.isInteger(k) || k < 0 || k > 9) throw new Error('k is an integer from 0 to 9.')
  return { grid, k }
}

// Fix the left column. A row gives a run of columns that stays at most k and non-increasing;
// a block of rows keeps the smallest such run as its width, and shrinking it to 0 ends that block.
export const code = `count submatrices that are sorted row by row with every value at most k
  total = 0
  for left from 0 to cols minus 1
    width[r] = longest run from left in row r that is at most k and non-increasing
    for top from 0 to rows minus 1
      smallest = infinity
      for bottom from top to rows minus 1
        smallest = min(smallest, width[bottom])
        if smallest is 0 then stop this top
        total = total + smallest
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_sorted_submatrices(grid, k):
    rows = len(grid)
    cols = len(grid[0])
    total = 0
    for left in range(cols):
        width = [0] * rows
        for r in range(rows):
            if grid[r][left] > k:
                continue
            w = 1
            while left + w < cols and grid[r][left + w] <= k and grid[r][left + w] <= grid[r][left + w - 1]:
                w += 1
            width[r] = w
        for top in range(rows):
            smallest = float('inf')
            for bottom in range(top, rows):
                smallest = min(smallest, width[bottom])
                if smallest == 0:
                    break
                total += smallest
    return total
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ grid, k }) {
  const frames = []
  const rows = grid.length
  const cols = grid[0].length
  let total = 0
  let width = []
  const push = (phase, codeText, pyText, message, extra = {}) => {
    frames.push({
      phase, activeLine: L(codeText), pythonLine: P(pyText), message,
      grid, k, rows, cols, total, left: -1, width: [...width], top: -1, bottom: -1, smallest: null, ...extra,
    })
  }

  push('start', 'total = 0', 'total = 0', `Scan a ${rows} by ${cols} grid for submatrices where every value is at most ${k} and each row is non-increasing.`)
  for (let left = 0; left < cols; left += 1) {
    width = Array(rows).fill(0)
    for (let r = 0; r < rows; r += 1) {
      if (grid[r][left] > k) {
        push('run', 'width[r] = longest run from left', 'if grid[r][left] > k', `Row ${r} starts above k at column ${left}; its run is 0.`, { left, row: r })
        continue
      }
      let w = 1
      while (left + w < cols && grid[r][left + w] <= k && grid[r][left + w] <= grid[r][left + w - 1]) w += 1
      width[r] = w
      push('run', 'width[r] = longest run from left', 'width[r] = w', `Row ${r} from column ${left} runs ${w} column${w === 1 ? '' : 's'} while staying sorted and at most ${k}.`, { left, row: r })
    }
    for (let top = 0; top < rows; top += 1) {
      let smallest = Infinity
      for (let bottom = top; bottom < rows; bottom += 1) {
        smallest = Math.min(smallest, width[bottom])
        if (smallest === 0) {
          push('stop', 'if smallest is 0 then stop this top', 'if smallest == 0', `Rows ${top} to ${bottom} include a row with no valid run; stop this top.`, { left, top, bottom, smallest })
          break
        }
        total += smallest
        push('count', 'total = total + smallest', 'total += smallest', `Rows ${top} to ${bottom} with width ${smallest} from column ${left} add ${smallest} submatrices.`, { left, top, bottom, smallest })
      }
    }
  }
  push('done', 'return total', 'return total', `The grid has ${total} sorted submatrices.`, { left: cols - 1, width: [...width], total, done: true })
  return { input: { grid, k }, result: total, frames }
}
