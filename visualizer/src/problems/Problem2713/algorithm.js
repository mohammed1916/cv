export function parseInput(text) {
  const mat = JSON.parse(text)
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 5) throw new Error('Use a matrix with 1 to 5 rows.')
  const width = Array.isArray(mat[0]) ? mat[0].length : 0
  if (width < 1 || width > 5) throw new Error('Each row has 1 to 5 entries.')
  for (const row of mat) {
    if (!Array.isArray(row) || row.length !== width) throw new Error('Every row must have the same length.')
    if (row.some(v => !Number.isInteger(v) || v < -20 || v > 20)) throw new Error('Values are integers from -20 to 20.')
  }
  return mat
}

export function buildTrace(mat) {
  const m = mat.length
  const n = mat[0].length
  const cells = []
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) cells.push({ r, c, v: mat[r][c] })
  cells.sort((a, b) => a.v - b.v)
  const rowBest = Array(m).fill(0)
  const colBest = Array(n).fill(0)
  const dp = Array.from({ length: m }, () => Array(n).fill(0))
  const snapshot = () => dp.map(row => [...row])
  const frames = [{ phase: 'start', activeLine: L('list every cell'), r: null, c: null, table: snapshot(), message: 'Every cell starts a path of length 1. Cells are processed from smallest value to largest.' }]
  let i = 0
  while (i < cells.length) {
    let j = i
    while (j < cells.length && cells[j].v === cells[i].v) j++
    for (let k = i; k < j; k++) {
      const { r, c, v } = cells[k]
      dp[r][c] = 1 + Math.max(rowBest[r], colBest[c])
      frames.push({ phase: 'cell', activeLine: L('set dp of each cell'), r, c, table: snapshot(), message: `Cell (${r}, ${c}) holds ${v}: 1 plus the best smaller value in its row or column gives ${dp[r][c]}.` })
    }
    // Equal values cannot chain, so the group updates the row and column bests only after every cell in it is set.
    for (let k = i; k < j; k++) {
      const { r, c } = cells[k]
      rowBest[r] = Math.max(rowBest[r], dp[r][c])
      colBest[c] = Math.max(colBest[c], dp[r][c])
    }
    frames.push({ phase: 'group', activeLine: L('after the group'), r: null, c: null, table: snapshot(), message: `Group of value ${cells[i].v} done; row and column bests are updated.` })
    i = j
  }
  const result = Math.max(...dp.flat())
  frames.push({ phase: 'done', activeLine: L('return the largest dp'), r: null, c: null, table: snapshot(), message: `The longest strictly increasing path has ${result} cells.` })
  return { input: mat, result, frames }
}

export const code = `longest strictly increasing path in a matrix:
  list every cell with its value
  sort the cells from smallest value to largest
  for each group of cells with the same value:
    set dp of each cell to 1 plus the best dp in its row or column so far
    after the group, record each cell's dp as its row and column best
  return the largest dp`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_increasing_cells(mat):
    m = len(mat)
    n = len(mat[0])
    cells = sorted((mat[r][c], r, c) for r in range(m) for c in range(n))
    row_best = [0] * m
    col_best = [0] * n
    dp = [[0] * n for _ in range(m)]
    i = 0
    while i < len(cells):
        j = i
        while j < len(cells) and cells[j][0] == cells[i][0]:
            j += 1
        for k in range(i, j):
            _, r, c = cells[k]
            dp[r][c] = 1 + max(row_best[r], col_best[c])
        for k in range(i, j):
            _, r, c = cells[k]
            row_best[r] = max(row_best[r], dp[r][c])
            col_best[c] = max(col_best[c], dp[r][c])
        i = j
    return max(max(row) for row in dp)
`
