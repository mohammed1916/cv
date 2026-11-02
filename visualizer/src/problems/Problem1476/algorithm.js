const PY = text => python.split('\n').findIndex(line => line.includes(text)) + 1
const L = text => code.findIndex(line => line.text.includes(text)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with rectangle and ops.')
  const { rectangle, ops } = input
  if (!Array.isArray(rectangle) || rectangle.length < 1 || rectangle.length > 6) throw new Error('rectangle has 1 to 6 rows.')
  const cols = rectangle[0].length
  if (!Array.isArray(rectangle[0]) || cols < 1 || cols > 6) throw new Error('rectangle has 1 to 6 columns.')
  for (const row of rectangle) {
    if (!Array.isArray(row) || row.length !== cols || !row.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each cell is an integer from 1 to 1000 in a full rectangle.')
  }
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 20) throw new Error('ops is a list of 1 to 20 operations.')
  const rows = rectangle.length
  const inside = (r, c) => Number.isInteger(r) && Number.isInteger(c) && r >= 0 && r < rows && c >= 0 && c < cols
  for (const op of ops) {
    if (!Array.isArray(op)) throw new Error('Each operation is an array.')
    if (op[0] === 'updateSubrectangle') {
      const [, r1, c1, r2, c2, v] = op
      if (op.length !== 6 || !inside(r1, c1) || !inside(r2, c2) || r1 > r2 || c1 > c2) throw new Error('updateSubrectangle needs row1, col1, row2, col2 inside the rectangle, with row1 <= row2 and col1 <= col2.')
      if (!Number.isInteger(v) || v < 1 || v > 1000) throw new Error('newValue is an integer from 1 to 1000.')
    } else if (op[0] === 'getValue') {
      if (op.length !== 3 || !inside(op[1], op[2])) throw new Error('getValue needs a row and column inside the rectangle.')
    } else throw new Error('Operations are updateSubrectangle or getValue.')
  }
  return { rectangle, ops }
}

const inRegion = (region, r, c) => !!region && r >= region[0] && r <= region[2] && c >= region[1] && c <= region[3]

export function buildTrace({ rectangle, ops }) {
  const updates = []
  const frames = []
  const outputs = []
  const snapshot = () => {
    const grid = rectangle.map(row => row.slice())
    for (const [r1, c1, r2, c2, v] of updates) for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) grid[r][c] = v
    return grid
  }
  frames.push({ pythonLine: PY('self.rectangle = '), activeLine: L('store the base rectangle'), phase: 'start', message: 'Keep the original rectangle and an empty update log.', grid: snapshot(), region: null, query: null, row: 0, column: 0, answer: null })
  for (const op of ops) {
    if (op[0] === 'updateSubrectangle') {
      const [, r1, c1, r2, c2, v] = op
      updates.push([r1, c1, r2, c2, v])
      outputs.push(null)
      frames.push({ pythonLine: PY('self.updates.append'), activeLine: L('append the update'), phase: 'update', message: `Log ${v} over rows ${r1}–${r2}, columns ${c1}–${c2}. Nothing else is touched yet.`, grid: snapshot(), region: [r1, c1, r2, c2], query: null, row: r1, column: c1, answer: null })
      continue
    }
    const [, row, col] = op
    let answer = null
    let source = 'base'
    for (let k = updates.length - 1; k >= 0; k--) {
      const [r1, c1, r2, c2, v] = updates[k]
      const covers = row >= r1 && row <= r2 && col >= c1 && col <= c2
      frames.push({ pythonLine: PY('if r1 <= row'), activeLine: L('newest first'), phase: 'scan', message: `Check update ${k} (value ${v}) for cell [${row}, ${col}]: ${covers ? 'it covers the cell' : 'it misses the cell'}.`, grid: snapshot(), region: [r1, c1, r2, c2], query: [row, col], row, column: col, answer: null })
      if (covers) { answer = v; source = 'update'; break }
    }
    if (source === 'base') answer = rectangle[row][col]
    outputs.push(answer)
    frames.push({ pythonLine: source === 'update' ? PY('return value') : PY('return self.rectangle'), activeLine: L('return the value'), phase: 'answer', message: source === 'update' ? `Cell [${row}, ${col}] answers ${answer} from the newest covering update.` : `No update covers [${row}, ${col}]; the base value ${answer} is returned.`, grid: snapshot(), region: null, query: [row, col], row, column: col, answer })
  }
  frames.push({ pythonLine: PY('return out'), activeLine: L('return the answers'), phase: 'done', message: 'All operations processed.', grid: snapshot(), region: null, query: null, row: 0, column: 0, answer: null })
  return { input: { rectangle, ops }, result: outputs, frames }
}

export const code = `class SubrectangleQueries with a base rectangle and an update log
  store the base rectangle
  start with an empty update log
  updateSubrectangle(row1, col1, row2, col2, newValue)
    append the update to the log
  getValue(row, col)
    for each update from newest to oldest
      if the update covers row and col then return its value
    return the base value at row and col`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `class SubrectangleQueries:
    def __init__(self, rectangle):
        self.rectangle = [row[:] for row in rectangle]
        self.updates = []

    def updateSubrectangle(self, row1, col1, row2, col2, newValue):
        self.updates.append((row1, col1, row2, col2, newValue))

    def getValue(self, row, col):
        for r1, c1, r2, c2, value in reversed(self.updates):
            if r1 <= row <= r2 and c1 <= col <= c2:
                return value
        return self.rectangle[row][col]


def run_subrectangle(rectangle, ops):
    obj = SubrectangleQueries(rectangle)
    out = []
    for op in ops:
        if op[0] == "updateSubrectangle":
            obj.updateSubrectangle(*op[1:])
            out.append(None)
        else:
            out.append(obj.getValue(*op[1:]))
    return out
`
