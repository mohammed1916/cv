export const phases = [
  { id: 'setup', label: 'Set up', description: 'Start with a height of zero under every column.' },
  { id: 'heights', label: 'Grow heights', description: 'Each column counts the consecutive ones that end at the current row.' },
  { id: 'extend', label: 'Extend left', description: 'Fix a right edge and widen to the left. The height is the shortest column seen so far.' },
  { id: 'count', label: 'Count rectangles', description: 'Each height up to the shortest column gives one all-one rectangle with this bottom row.' },
  { id: 'done', label: 'Complete', description: 'Return the number of all-one submatrices.' },
]

export function parseInput(text) {
  const mat = JSON.parse(text)
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 6 || !mat.every(row => Array.isArray(row))) throw new Error('Enter a JSON array of 1 to 6 rows.')
  const cols = mat[0].length
  if (cols < 1 || cols > 6 || !mat.every(row => row.length === cols && row.every(v => v === 0 || v === 1))) throw new Error('Every row needs the same length, from 1 to 6 columns, containing only 0 or 1.')
  return mat
}

export const code = `count all-one submatrices (mat):
  heights = zero for every column
  total = 0
  for each row in mat:
    for each column c: heights[c] = heights[c] + 1 if cell is 1, else 0
    for right in columns:
      low = heights[right]
      for left from right down to 0:
        low = min(low, heights[left])
        if low == 0: stop widening this right edge
        total += low
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_submatrices(mat):
    cols = len(mat[0])
    heights = [0] * cols
    total = 0
    for row in mat:
        for c in range(cols):
            heights[c] = heights[c] + 1 if row[c] == 1 else 0
        for right in range(cols):
            low = heights[right]
            for left in range(right, -1, -1):
                low = min(low, heights[left])
                if low == 0:
                    break
                total += low
    return total
`

// Each key names the pseudocode line and the Python line it corresponds to.
const SPOT = {
  start: ['heights = zero', 'heights = [0]'],
  grow: ['heights[c] = heights[c] + 1', 'heights[c] = heights[c] + 1'],
  right: ['low = heights[right]', 'low = heights[right]'],
  min: ['low = min(', 'low = min('],
  stop: ['if low == 0', 'if low == 0'],
  add: ['total += low', 'total += low'],
  done: ['return total', 'return total'],
}
function where(key) {
  const [pseudo, py] = SPOT[key]
  return {
    activeLine: code.findIndex(c => c.text.includes(pseudo)) + 1,
    pythonLine: python.split('\n').findIndex(l => l.includes(py)) + 1,
  }
}

export function buildTrace(mat) {
  const cols = mat[0].length
  const heights = Array(cols).fill(0)
  const frames = []
  let total = 0
  const emit = (phase, key, row, message, extra = {}) => frames.push({
    phase, ...where(key), message, snapshot: { row, heights: [...heights], total, ...extra },
  })

  emit('setup', 'start', -1, `Heights start at zero for all ${cols} columns. Rows are read from top to bottom.`)
  mat.forEach((line, row) => {
    for (let c = 0; c < cols; c++) heights[c] = line[c] ? heights[c] + 1 : 0
    emit('heights', 'grow', row, `Row ${row + 1}: a column gains one when its cell is 1 and resets to 0 otherwise. Heights are now ${heights.join(', ')}.`)
    for (let right = 0; right < cols; right++) {
      let low = heights[right]
      emit('extend', 'right', row, `Right edge at column ${right + 1}. Starting height is ${low}.`, { right, left: right, low })
      for (let left = right; left >= 0; left--) {
        low = Math.min(low, heights[left])
        emit('extend', 'min', row, `Include column ${left + 1}. The rectangle height is capped at ${low}.`, { right, left, low })
        if (low === 0) {
          emit('extend', 'stop', row, 'A zero column ends every taller rectangle for this right edge, so widening stops.', { right, left, low })
          break
        }
        total += low
        emit('count', 'add', row, `Columns ${left + 1} to ${right + 1} with bottom row ${row + 1} give ${low} rectangle${low === 1 ? '' : 's'}. Running total ${total}.`, { right, left, low })
      }
    }
  })
  emit('done', 'done', mat.length - 1, `Total all-one submatrices: ${total}.`)
  return { input: mat, result: total, frames }
}
