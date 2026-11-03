export const phases = [
  { id: 'start', label: 'Start', description: 'Read the matrix and its distinct values.' },
  { id: 'inspect', label: 'Extremes', description: 'Find each row minimum and each column maximum.' },
  { id: 'update', label: 'Check cell', description: 'A cell is lucky only if it is both its row minimum and its column maximum.' },
  { id: 'done', label: 'Complete', description: 'The lucky values are collected in row-major order.' },
]

export function parseInput(text) {
  const value = JSON.parse(text)
  const matrix = value?.matrix
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 10 || !Array.isArray(matrix[0]) || matrix[0].length < 1 || matrix[0].length > 10) {
    throw new Error('Enter JSON like {"matrix":[[3,7],[1,9]]} with a 1–10 by 1–10 matrix.')
  }
  const width = matrix[0].length
  const all = []
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== width || row.some(v => !Number.isInteger(v) || v < 0 || v > 100)) {
      throw new Error('Every row must have the same length, and every value must be an integer from 0 to 100.')
    }
    all.push(...row)
  }
  if (new Set(all).size !== all.length) throw new Error('Values must be distinct, so each lucky cell is unambiguous.')
  return { matrix }
}

const LINE = { start: 1, rowMin: 2, colMax: 3, cell: 7, lucky: 8, done: 9 }

export function buildTrace(input) {
  const { matrix } = input
  const m = matrix.length, n = matrix[0].length
  const frames = []
  const rowMin = [], colMax = []
  const lucky = []
  frames.push({
    phase: 'start', activeLine: LINE.start,
    message: `The matrix has ${m} rows and ${n} columns. Lucky cells need a row minimum and a column maximum at the same position.`,
    snapshot: { matrix, rowMin: [], colMax: [], cell: null, lucky: [] },
  })
  for (let i = 0; i < m; i++) {
    rowMin.push(Math.min(...matrix[i]))
    frames.push({
      phase: 'inspect', activeLine: LINE.rowMin,
      message: `Row ${i} has minimum ${rowMin[i]}.`,
      snapshot: { matrix, rowMin: [...rowMin], colMax: [], cell: null, lucky: [] },
    })
  }
  for (let j = 0; j < n; j++) {
    colMax.push(Math.max(...matrix.map(row => row[j])))
    frames.push({
      phase: 'inspect', activeLine: LINE.colMax,
      message: `Column ${j} has maximum ${colMax[j]}.`,
      snapshot: { matrix, rowMin: [...rowMin], colMax: [...colMax], cell: null, lucky: [] },
    })
  }
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const v = matrix[i][j]
      const isLucky = v === rowMin[i] && v === colMax[j]
      if (isLucky) lucky.push(v)
      frames.push({
        phase: 'update', activeLine: LINE.cell,
        message: isLucky
          ? `${v} at [${i}, ${j}] is the minimum of row ${i} and the maximum of column ${j}, so it is lucky.`
          : `${v} at [${i}, ${j}] fails: ${v !== rowMin[i] ? `row ${i} has a smaller value` : `column ${j} has a larger value`}.`,
        snapshot: { matrix, rowMin: [...rowMin], colMax: [...colMax], cell: [i, j], lucky: [...lucky], isLucky },
      })
    }
  }
  frames.push({
    phase: 'done', activeLine: LINE.done,
    message: lucky.length ? `Lucky values: ${lucky.join(', ')}.` : 'No cell is lucky, so the answer is empty.',
    snapshot: { matrix, rowMin: [...rowMin], colMax: [...colMax], cell: null, lucky: [...lucky] },
  })
  return { input, result: lucky, frames }
}

export const code = `lucky_numbers(matrix):
  row_min[i] = smallest value in row i
  col_max[j] = largest value in column j
  result = empty list
  for i in rows:
    for j in columns:
      if matrix[i][j] == row_min[i] and matrix[i][j] == col_max[j]:
        append matrix[i][j] to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def lucky_numbers(matrix):
    row_min = [min(row) for row in matrix]
    col_max = [max(col) for col in zip(*matrix)]
    result = []
    for i in range(len(matrix)):
        for j in range(len(matrix[0])):
            if matrix[i][j] == row_min[i] and matrix[i][j] == col_max[j]:
                result.append(matrix[i][j])
    return result`
