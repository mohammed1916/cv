export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with arr and mat.')
  const { arr, mat } = input
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 6 || !Array.isArray(mat[0]) || mat[0].length < 1 || mat[0].length > 6) throw new Error('mat must be at most 6 by 6.')
  const rows = mat.length
  const cols = mat[0].length
  const size = rows * cols
  if (!Array.isArray(arr) || arr.length !== size) throw new Error('arr must have one entry for each cell of mat.')
  const sortedArr = [...arr].sort((a, b) => a - b)
  const sortedMat = mat.flat().sort((a, b) => a - b)
  const oneToSize = Array.from({ length: size }, (_, i) => i + 1)
  if (sortedArr.some((v, i) => v !== oneToSize[i]) || sortedMat.some((v, i) => v !== oneToSize[i])) throw new Error('arr and mat must each hold every integer from 1 to rows times cols, exactly once.')
  return { arr, mat }
}

export function buildTrace(input) {
  const { arr, mat } = input
  const rows = mat.length
  const cols = mat[0].length
  const where = new Map()
  mat.forEach((row, r) => row.forEach((value, c) => where.set(value, [r, c])))
  const rowCount = Array(rows).fill(0)
  const colCount = Array(cols).fill(0)
  const painted = []
  const frames = [{ phase: 'start', activeLine: L('record the row and column of each value'), painted: [], row: -1, col: -1, index: -1, message: 'Find where each value sits in mat, then paint in the order of arr.' }]
  for (let i = 0; i < arr.length; i++) {
    const [r, c] = where.get(arr[i])
    rowCount[r] += 1
    colCount[c] += 1
    painted.push({ row: r, col: c })
    const full = rowCount[r] === cols ? 'row' : colCount[c] === rows ? 'column' : null
    if (full) {
      frames.push({ phase: 'done', activeLine: L('return i'), painted: [...painted], row: r, col: c, index: i, message: `Painting ${arr[i]} at (${r}, ${c}) completes a ${full}. Answer: ${i}.` })
      return { input, result: i, frames }
    }
    frames.push({ phase: 'paint', activeLine: L('paint the cell holding'), painted: [...painted], row: r, col: c, index: i, message: `Paint ${arr[i]} at (${r}, ${c}). Row ${r} has ${rowCount[r]} of ${cols}; column ${c} has ${colCount[c]} of ${rows}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), painted: [...painted], row: -1, col: -1, index: -1, message: 'No line was completed.' })
  return { input, result: -1, frames }
}

export const code = `first completely painted (arr, mat):
  record the row and column of each value in mat
  set every row count and column count to 0
  for each index i in arr
    paint the cell holding arr at i and add one to its row count and column count
    if its row count is full or its column count is full then
      return i
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def first_painted(arr, mat):
    rows, cols = len(mat), len(mat[0])
    where = {}
    for r in range(rows):
        for c in range(cols):
            where[mat[r][c]] = (r, c)
    row_count = [0] * rows
    col_count = [0] * cols
    for i, value in enumerate(arr):
        r, c = where[value]
        row_count[r] += 1
        col_count[c] += 1
        if row_count[r] == cols or col_count[c] == rows:
            return i
    return -1
`
