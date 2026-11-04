// LeetCode 2624: Snail Traversal.
// Fill a rowsCount by colsCount matrix from the input array column by column.
// Even columns run top to bottom; odd columns run bottom to top.
// If rowsCount times colsCount differs from the array length, the answer is an empty list.
// Visualization caps: rows and columns from 1 to 8, and an array of at most 64 values. The draft gives no official bound.

const MAX_SIDE = 8
const MAX_LENGTH = 64

const CODE_LINES = [
  'function snail(arr, rowsCount, colsCount) {',
  '  if (rowsCount * colsCount !== arr.length) return []',
  '  const matrix = Array.from({ length: rowsCount }, () => Array(colsCount))',
  '  let k = 0',
  '  for (let col = 0; col < colsCount; col++) {',
  '    const down = col % 2 === 0',
  '    const rows = down ? [...Array(rowsCount).keys()] : [...Array(rowsCount).keys()].reverse()',
  '    for (const row of rows) {',
  '      matrix[row][col] = arr[k]; k++',
  '    }',
  '  }',
  '  return matrix',
  '}',
]

const PYTHON_LINES = [
  'class Solution:',
  '    def snail(self, arr, rowsCount, colsCount):',
  '        if rowsCount * colsCount != len(arr):',
  '            return []',
  '        matrix = [[None] * colsCount for _ in range(rowsCount)]',
  '        k = 0',
  '        for col in range(colsCount):',
  '            rows = range(rowsCount) if col % 2 == 0 else range(rowsCount - 1, -1, -1)',
  '            for row in rows:',
  '                matrix[row][col] = arr[k]',
  '                k += 1',
  '        return matrix',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(json.dumps(Solution().snail(data["arr"], data["rowsCount"], data["colsCount"])))',
]

const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const python = PYTHON_LINES.join('\n') + '\n'

function L(text) {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}

function P(text) {
  const index = PYTHON_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

const phases = [
  { id: 'check', label: 'Check size', description: 'The grid must hold exactly the array values.' },
  { id: 'column', label: 'Next column', description: 'Pick the direction for this column.' },
  { id: 'place', label: 'Place values', description: 'Write each array value into its cell.' },
  { id: 'done', label: 'Matrix', description: 'The finished snail-ordered matrix.' },
]

const pythonLineMap = { 1: 1, 2: 3, 3: 5, 4: 9, 5: 6, 6: 7, 7: 9, 8: 10, 9: 12 }

export { code, python, phases, pythonLineMap }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with arr, rowsCount and colsCount.')
  const { arr, rowsCount, colsCount } = input
  const side = value => Number.isInteger(value) && value >= 1 && value <= MAX_SIDE
  if (!side(rowsCount) || !side(colsCount)) throw new Error(`rowsCount and colsCount are integers from 1 to ${MAX_SIDE}.`)
  if (!Array.isArray(arr) || arr.length > MAX_LENGTH || !arr.every(value => Number.isInteger(value))) {
    throw new Error(`arr is a list of at most ${MAX_LENGTH} integers.`)
  }
  return { arr: [...arr], rowsCount, colsCount }
}

export function buildTrace({ arr, rowsCount, colsCount }) {
  const frames = []
  const emptyGrid = () => Array.from({ length: rowsCount }, () => Array(colsCount).fill(null))
  const snapshot = extra => ({ arr, rows: rowsCount, cols: colsCount, matrix: emptyGrid(), order: null, cursor: null, k: null, direction: null, mismatch: false, ...extra })

  const fits = rowsCount * colsCount === arr.length
  frames.push({
    phase: 'check', activeLine: L('if (rowsCount * colsCount !== arr.length)'), pythonLine: P('if rowsCount * colsCount'),
    message: `${rowsCount} × ${colsCount} = ${rowsCount * colsCount} cells for ${arr.length} value${arr.length === 1 ? '' : 's'}.`,
    view: snapshot({ mismatch: !fits }),
  })
  if (!fits) {
    frames.push({ phase: 'done', activeLine: L('return []'), pythonLine: P('return []'), message: 'The sizes differ, so the answer is an empty list.', view: snapshot({ mismatch: true, answer: [] }) })
    return { input: { arr, rowsCount, colsCount }, result: [], frames }
  }

  const matrix = emptyGrid()
  const order = emptyGrid()
  let k = 0
  frames.push({ phase: 'check', activeLine: L('const matrix = Array.from'), pythonLine: P('matrix = [[None]'), message: `An empty ${rowsCount} by ${colsCount} grid.`, view: snapshot({ matrix: copy(matrix), order: copy(order), k }) })
  frames.push({ phase: 'check', activeLine: L('let k = 0'), pythonLine: P('k = 0'), message: 'Next array index to place is 0.', view: snapshot({ matrix: copy(matrix), order: copy(order), k }) })

  for (let col = 0; col < colsCount; col++) {
    const down = col % 2 === 0
    frames.push({
      phase: 'column', activeLine: L('const down = col % 2 === 0'), pythonLine: P('rows = range(rowsCount) if'),
      message: `Column ${col}: ${down ? 'top to bottom' : 'bottom to top'}.`,
      view: snapshot({ matrix: copy(matrix), order: copy(order), k, direction: down ? 'down' : 'up', column: col }),
    })
    const rows = down ? [...Array(rowsCount).keys()] : [...Array(rowsCount).keys()].reverse()
    for (const row of rows) {
      matrix[row][col] = arr[k]
      order[row][col] = k
      frames.push({
        phase: 'place', activeLine: L('matrix[row][col] = arr[k]'), pythonLine: P('matrix[row][col] = arr[k]'),
        message: `arr[${k}] = ${arr[k]} goes to row ${row}, column ${col}.`,
        view: snapshot({ matrix: copy(matrix), order: copy(order), k, cursor: { row, col }, direction: down ? 'down' : 'up', column: col }),
      })
      k++
      frames.push({ phase: 'place', activeLine: L('matrix[row][col] = arr[k]'), pythonLine: P('k += 1'), message: `Next index is ${k}.`, view: snapshot({ matrix: copy(matrix), order: copy(order), k, direction: down ? 'down' : 'up', column: col }) })
    }
  }

  frames.push({ phase: 'done', activeLine: L('return matrix'), pythonLine: P('return matrix'), message: 'Every value is placed exactly once.', view: snapshot({ matrix: copy(matrix), order: copy(order), k, answer: copy(matrix) }) })
  return { input: { arr, rowsCount, colsCount }, result: matrix, frames }
}

function copy(grid) {
  return grid.map(row => [...row])
}
