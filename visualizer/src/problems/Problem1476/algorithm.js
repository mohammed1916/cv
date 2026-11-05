export const phases = [
  { id: 'start', label: 'Start', description: 'Store the rectangle as a grid of values. Each operation is applied in order.' },
  { id: 'update', label: 'Update block', description: 'Set every cell inside the rows r1..r2 and columns c1..c2 to the new value.' },
  { id: 'query', label: 'Read cell', description: 'Read one cell; it shows the value from the most recent update that covered it.' },
  { id: 'done', label: 'Complete', description: 'Return the answer of each getValue call; updates return null.' },
]

export const examples = [
  { label: 'Read, update, read', input: '{"rectangle":[[2,4],[6,8],[1,3]],"ops":[["getValue",1,0],["updateSubrectangle",0,0,2,1,7],["getValue",2,1],["getValue",0,1]]}' },
  { label: 'Overlapping blocks', input: '{"rectangle":[[1,1],[1,1]],"ops":[["updateSubrectangle",0,0,1,1,2],["updateSubrectangle",0,0,0,0,3],["getValue",0,0],["getValue",1,1]]}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.rectangle) || !Array.isArray(data.ops)) throw new Error('Use an object with rectangle and ops lists.')
  const rows = data.rectangle.length
  const cols = Array.isArray(data.rectangle[0]) ? data.rectangle[0].length : 0
  if (rows < 1 || rows > 8 || cols < 1 || cols > 8) throw new Error('rectangle must be 1 to 8 rows and 1 to 8 columns in this visualization.')
  if (data.rectangle.some(row => !Array.isArray(row) || row.length !== cols || row.some(v => !Number.isInteger(v)))) throw new Error('rectangle must be a grid of integers.')
  if (data.ops.length > 30) throw new Error('Use at most 30 operations in this visualization.')
  for (const op of data.ops) {
    if (op[0] === 'updateSubrectangle') {
      const [, r1, c1, r2, c2, v] = op
      if (![r1, c1, r2, c2, v].every(Number.isInteger)) throw new Error('updateSubrectangle needs five integers.')
      if (r1 < 0 || c1 < 0 || r2 >= rows || c2 >= cols || r1 > r2 || c1 > c2) throw new Error('updateSubrectangle corners must be inside the rectangle, with top-left first.')
    } else if (op[0] === 'getValue') {
      const [, r, c] = op
      if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || c < 0 || r >= rows || c >= cols) throw new Error('getValue needs a cell inside the rectangle.')
    } else {
      throw new Error(`Unknown operation ${JSON.stringify(op[0])}.`)
    }
  }
  return { rectangle: data.rectangle, ops: data.ops }
}

export function buildTrace({ rectangle, ops }) {
  const rect = rectangle.map(row => [...row])
  const answers = []
  const log = []
  const snap = (extra = {}) => ({ rect: rect.map(row => [...row]), answers: [...answers], log: [...log], ...extra })
  const frames = [{ phase: 'start', activeLine: L('const rect = '), pythonLine: P('rect = ['), snapshot: snap(),
    message: `A ${rect.length} by ${rect[0].length} rectangle with ${ops.length} operations.` }]
  for (const op of ops) {
    if (op[0] === 'updateSubrectangle') {
      const [, r1, c1, r2, c2, v] = op
      for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) rect[r][c] = v
      answers.push(null)
      log.push(`update rows ${r1}-${r2}, cols ${c1}-${c2} to ${v}`)
      frames.push({ phase: 'update', activeLine: L('for (let r = r1'), pythonLine: P('for r in range(r1'), snapshot: snap({ box: { r1, c1, r2, c2 } }),
        message: `Set rows ${r1} to ${r2} and columns ${c1} to ${c2} to ${v}.` })
    } else {
      const [, r, c] = op
      answers.push(rect[r][c])
      log.push(`read (${r}, ${c}) = ${rect[r][c]}`)
      frames.push({ phase: 'query', activeLine: L('answers.push(rect[r][c])'), pythonLine: P('answers.append'), snapshot: snap({ cell: { row: r, col: c } }),
        message: `getValue(${r}, ${c}) is ${rect[r][c]}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), pythonLine: P('return answers'), snapshot: snap(),
    message: `Return [${answers.map(a => (a === null ? 'null' : a)).join(', ')}].`, result: answers })
  return { input: { rectangle, ops }, result: answers, frames }
}

export const code = `function runSubrectangleOps(rectangle, ops) {
  const rect = rectangle.map(row => [...row])
  const answers = []
  for (const op of ops) {
    if (op[0] === 'updateSubrectangle') {
      const [, r1, c1, r2, c2, v] = op
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) rect[r][c] = v
      }
      answers.push(null)
    } else {
      const [, r, c] = op
      answers.push(rect[r][c])
    }
  }
  return answers
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def run_subrectangle_ops(rectangle, ops):
    rect = [list(row) for row in rectangle]
    answers = []
    for op in ops:
        if op[0] == 'updateSubrectangle':
            _, r1, c1, r2, c2, v = op
            for r in range(r1, r2 + 1):
                for c in range(c1, c2 + 1):
                    rect[r][c] = v
            answers.append(None)
        else:
            _, r, c = op
            answers.append(rect[r][c])
    return answers
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
