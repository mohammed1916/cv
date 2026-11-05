export function parseInput(text) {
  const matrix = JSON.parse(text)
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 8 || matrix.some(row => !Array.isArray(row) || row.length !== matrix[0].length || row.length < 1 || row.length > 8 || row.some(v => !Number.isInteger(v) || v < 0 || v > 99))) {
    throw new Error('Enter a rectangular matrix of up to 8 by 8 integers from 0 to 99.')
  }
  return matrix
}

const JS_LINES = [
  'function isToeplitzMatrix(matrix) {',
  '  for (let r = 1; r < matrix.length; r++) {',
  '    for (let c = 1; c < matrix[0].length; c++) {',
  '      if (matrix[r][c] !== matrix[r - 1][c - 1]) return false // this diagonal changes value',
  '    }',
  '  }',
  '  return true // every diagonal is constant',
  '}',
]
const PY_LINES = [
  'def is_toeplitz_matrix(matrix):',
  '    for r in range(1, len(matrix)):',
  '        for c in range(1, len(matrix[0])):',
  '            if matrix[r][c] != matrix[r - 1][c - 1]:',
  '                return False',
  '    return True',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Each cell except the first row and column must equal its upper-left neighbour. Any mismatch fails the whole matrix.
export function buildTrace(matrix) {
  const rows = matrix.length, cols = matrix[0].length
  const frames = [{ phase: 'start', cell: null, pair: null, activeLine: L('for (let r = 1'), pythonLine: P('for r in range(1'), message: 'Every cell below and to the right of the first row and column must match its upper-left neighbour.' }]
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      const same = matrix[r][c] === matrix[r - 1][c - 1]
      frames.push({ phase: same ? 'check' : 'fail', cell: [r, c], pair: [[r - 1, c - 1], [r, c]], activeLine: L(same ? 'if (matrix[r][c]' : 'return false'), pythonLine: P(same ? 'if matrix[r][c]' : 'return False'),
        message: same ? `(${r}, ${c}) = ${matrix[r][c]} equals (${r - 1}, ${c - 1}) = ${matrix[r - 1][c - 1]}.` : `(${r}, ${c}) = ${matrix[r][c]} but (${r - 1}, ${c - 1}) = ${matrix[r - 1][c - 1]}: this diagonal changes value.` })
      if (!same) return { input: matrix, result: false, frames }
    }
  }
  frames.push({ phase: 'done', cell: null, pair: null, result: true, activeLine: L('return true'), pythonLine: P('return True'), message: 'Every diagonal is constant, so the matrix is Toeplitz.' })
  return { input: matrix, result: true, frames }
}
