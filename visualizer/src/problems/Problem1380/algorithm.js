export const phases = [
  { id: 'start', label: 'Start', description: 'A lucky number is the smallest value in its row and the largest value in its column.' },
  { id: 'rowmin', label: 'Row minimum', description: 'Find the smallest value in the current row and mark its column.' },
  { id: 'colmax', label: 'Column maximum', description: 'Check whether that value is also the largest in its column.' },
  { id: 'lucky', label: 'Lucky', description: 'The value is the row minimum and the column maximum, so it is lucky.' },
  { id: 'done', label: 'Complete', description: 'Return every lucky number.' },
]

export const examples = [
  { label: 'Single lucky', input: '{"matrix":[[3,7,8],[9,11,13],[15,16,17]]}' },
  { label: 'Corner value', input: '{"matrix":[[1,10,4,2],[9,3,8,7],[15,16,17,12]]}' },
  { label: 'None', input: '{"matrix":[[7,8],[1,2]]}' },
  { label: "Single cell", input: "{\"matrix\":[[5]]}" },
  { label: "One row, one lucky value", input: "{\"matrix\":[[3,1,2]]}" },
  { label: "Largest grid, values 1 to 64", input: "{\"matrix\":[[1,2,3,4,5,6,7,8],[9,10,11,12,13,14,15,16],[17,18,19,20,21,22,23,24],[25,26,27,28,29,30,31,32],[33,34,35,36,37,38,39,40],[41,42,43,44,45,46,47,48],[49,50,51,52,53,54,55,56],[57,58,59,60,61,62,63,64]]}" },
  { label: "Long run: 8 by 8 grid", input: "{\"matrix\":[[88,96,67,59,80,58,92,30],[53,41,56,39,3,22,8,15],[69,40,100,38,23,55,12,93],[72,10,75,49,32,37,42,91],[54,60,43,64,31,21,63,1],[81,27,83,77,99,65,84,66],[82,28,86,19,89,57,90,29],[68,48,46,74,47,52,34,95]]}" },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.matrix)) throw new Error('Use an object with a matrix list, such as {"matrix":[[1,2],[3,4]]}.')
  const m = data.matrix.length
  if (m < 1 || m > 8) throw new Error('matrix must have 1 to 8 rows in this visualization.')
  const n = Array.isArray(data.matrix[0]) ? data.matrix[0].length : 0
  if (n < 1 || n > 8) throw new Error('matrix must have 1 to 8 columns in this visualization.')
  if (data.matrix.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('Every row must have the same length.')
  if (data.matrix.some(row => row.some(v => !Number.isInteger(v) || v < 1 || v > 100))) throw new Error('Every value must be an integer from 1 to 100.')
  const flat = data.matrix.flat()
  if (new Set(flat).size !== flat.length) throw new Error('All values must be distinct.')
  return { matrix: data.matrix }
}

export function buildTrace({ matrix }) {
  const m = matrix.length, n = matrix[0].length
  const result = []
  const snap = (extra = {}) => ({ matrix, found: [...result], ...extra })
  const frames = [{ phase: 'start', activeLine: L('const result = []'), pythonLine: P('result = []'), snapshot: snap(),
    message: 'Look at each row for its smallest value, then check that value against its column.' }]
  for (let r = 0; r < m; r++) {
    let minCol = 0
    for (let c = 1; c < n; c++) if (matrix[r][c] < matrix[r][minCol]) minCol = c
    const value = matrix[r][minCol]
    frames.push({ phase: 'rowmin', activeLine: L('let minCol = 0'), pythonLine: P('min_col = 0'), snapshot: snap({ row: r, col: minCol, value }),
      message: `Row ${r}: the smallest value is ${value}, in column ${minCol}.` })
    let colMax = true
    for (let rr = 0; rr < m; rr++) if (matrix[rr][minCol] > value) colMax = false
    frames.push({ phase: 'colmax', activeLine: L('for (let rr = 0'), pythonLine: P('for rr in range'), snapshot: snap({ row: r, col: minCol, value, colMax }),
      message: colMax ? `${value} is the largest in column ${minCol}, so it is lucky.` : `${value} has a bigger value below or above it in column ${minCol}, so it is not lucky.` })
    if (colMax) {
      result.push(value)
      frames.push({ phase: 'lucky', activeLine: L('result.push(value)'), pythonLine: P('result.append'), snapshot: snap({ row: r, col: minCol, value, colMax: true }),
        message: `${value} is lucky.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), snapshot: snap({ result: [...result] }),
    message: `Return [${result.join(', ')}].`, result })
  return { input: { matrix }, result, frames }
}

export const code = `function luckyNumbers(matrix) {
  const m = matrix.length, n = matrix[0].length
  const result = []
  for (let r = 0; r < m; r++) {
    let minCol = 0
    for (let c = 1; c < n; c++) if (matrix[r][c] < matrix[r][minCol]) minCol = c
    const value = matrix[r][minCol]
    let colMax = true
    for (let rr = 0; rr < m; rr++) if (matrix[rr][minCol] > value) colMax = false
    if (colMax) result.push(value)
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def lucky_numbers(matrix):
    m, n = len(matrix), len(matrix[0])
    result = []
    for r in range(m):
        min_col = 0
        for c in range(1, n):
            if matrix[r][c] < matrix[r][min_col]:
                min_col = c
        value = matrix[r][min_col]
        col_max = True
        for rr in range(m):
            if matrix[rr][min_col] > value:
                col_max = False
        if col_max:
            result.append(value)
    return result
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
