// LeetCode 1975: flipping two neighbours keeps the parity of negatives; odd parity forces one negative sign to remain, so give up the smallest magnitude twice.
const SOURCE = [
  "function maxMatrixSum(matrix) {",
  "  let total = 0, negatives = 0, smallest = Infinity",
  "  for (const row of matrix) {",
  "    for (const value of row) {",
  "      total += Math.abs(value)",
  "      if (value < 0) negatives++",
  "      smallest = Math.min(smallest, Math.abs(value))",
  "    }",
  "  }",
  "  return negatives % 2 === 0 ? total : total - 2 * smallest",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def max_matrix_sum(matrix):
    total = 0
    negatives = 0
    smallest = float("inf")
    for row in matrix:
        for value in row:
            total += abs(value)
            if value < 0:
                negatives += 1
            smallest = min(smallest, abs(value))
    if negatives % 2 == 0:
        return total
    return total - 2 * smallest
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'scan', label: 'Scan cells', description: 'Add absolute values, count negatives, track the smallest magnitude.' },
  { id: 'parity', label: 'Parity', description: 'Decide whether one sign must stay negative.' },
  { id: 'done', label: 'Result', description: 'Maximum matrix sum.' },
]

export function parseInput(text) {
  let matrix
  try { matrix = JSON.parse(text) } catch { throw new Error('Enter a JSON square matrix, for example [[1,-1],[-1,1]].') }
  if (!Array.isArray(matrix) || matrix.length < 2 || matrix.length > 4) throw new Error('Use a square matrix from 2 by 2 to 4 by 4.')
  if (!matrix.every(row => Array.isArray(row) && row.length === matrix.length && row.every(v => Number.isInteger(v) && Math.abs(v) <= 100000))) throw new Error('The matrix must be square with integers up to 100000 in size.')
  return { matrix }
}

export function buildTrace({ matrix }) {
  const frames = []
  let total = 0, negatives = 0, smallest = Infinity
  let smallestAt = null
  for (let r = 0; r < matrix.length; r++) for (let c = 0; c < matrix[r].length; c++) {
    const v = matrix[r][c]
    total += Math.abs(v)
    if (v < 0) negatives++
    if (Math.abs(v) < smallest) { smallest = Math.abs(v); smallestAt = [r, c] }
    frames.push({ phase: 'scan', activeLine: L('total += Math.abs'), pythonLine: P('total += abs'), message: `Cell (${r}, ${c}) = ${v}: total ${total}, negatives ${negatives}.`, cell: [r, c], total, negatives, smallest, smallestAt: [...smallestAt], parity: null })
  }
  frames.push({ phase: 'parity', activeLine: L('negatives % 2 === 0'), pythonLine: P('if negatives % 2'), message: negatives % 2 === 0 ? `${negatives} negatives is even, so every value can be made positive.` : `${negatives} negatives is odd, so one value stays negative; the smallest magnitude ${smallest} is the one to keep negative.`, cell: null, total, negatives, smallest, smallestAt, parity: negatives % 2 === 0 })
  const result = negatives % 2 === 0 ? total : total - 2 * smallest
  frames.push({ phase: 'done', activeLine: L('total - 2 * smallest'), pythonLine: P('total - 2 * smallest'), message: `Maximum sum: ${result}.`, cell: null, total, negatives, smallest, smallestAt, parity: negatives % 2 === 0, result })
  return { input: { matrix }, result, frames }
}
