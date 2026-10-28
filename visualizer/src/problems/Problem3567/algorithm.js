export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid and k.')
  const { grid, k } = input
  if (!Array.isArray(grid) || grid.length < 2 || grid.length > 6 || !Array.isArray(grid[0]) || grid[0].length < 2 || grid[0].length > 6) throw new Error('grid must be between 2 and 6 rows and columns.')
  const m = grid.length
  const n = grid[0].length
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 1 || v > 50))) throw new Error('grid must be rectangular, with integers from 1 to 50.')
  if (!Number.isInteger(k) || k < 1 || k > Math.min(m, n)) throw new Error('k must be from 1 to the smaller grid side.')
  return { grid, k }
}

export function buildTrace(input) {
  const { grid, k } = input
  const rows = grid.length
  const cols = grid[0].length
  const answer = Array.from({ length: rows - k + 1 }, () => Array(cols - k + 1).fill(0))
  const frames = [{ phase: 'start', activeLine: L('create an answer'), window: null, answer: answer.map(r => [...r]), best: null, message: `Each ${k} by ${k} window gets one answer.` }]
  for (let i = 0; i + k <= rows; i++) {
    for (let j = 0; j + k <= cols; j++) {
      const window = []
      for (let a = i; a < i + k; a++) for (let b = j; b < j + k; b++) window.push(grid[a][b])
      const values = [...new Set(window)].sort((x, y) => x - y)
      let best = 0
      if (values.length >= 2) {
        best = Infinity
        for (let t = 0; t + 1 < values.length; t++) best = Math.min(best, values[t + 1] - values[t])
      }
      answer[i][j] = best
      const cells = []
      for (let a = i; a < i + k; a++) for (let b = j; b < j + k; b++) cells.push({ row: a, col: b })
      frames.push({ phase: 'window', activeLine: L('smallest gap between neighbouring values'), window: { row: i, col: j, k, cells }, answer: answer.map(r => [...r]), best, message: `Window at (${i}, ${j}) has distinct values ${values.join(', ')}; smallest gap ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), window: null, answer: answer.map(r => [...r]), best: null, message: 'Every window has its answer.' })
  return { input, result: answer, frames }
}

export const code = `minimum absolute difference in sliding submatrix (grid, k):
  create an answer of size (rows minus k plus 1) by (columns minus k plus 1)
  for each top-left corner (i, j) of a k by k window
    collect the k by k values into a list
    remove duplicates and sort the list
    set best to 0
    if the list has at least two values then
      set best to the smallest gap between neighbouring values
    store best at (i, j) in the answer
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_abs_diff_sliding(grid, k):
    rows, cols = len(grid), len(grid[0])
    answer = []
    for i in range(rows - k + 1):
        line = []
        for j in range(cols - k + 1):
            values = sorted({grid[a][b] for a in range(i, i + k) for b in range(j, j + k)})
            best = 0
            if len(values) >= 2:
                best = min(values[t + 1] - values[t] for t in range(len(values) - 1))
            line.append(best)
        answer.append(line)
    return answer
`
