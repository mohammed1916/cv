const MAX_SIDE = 5
// A failed 5 x 5 search can visit far more states than anyone can step through.
export const FRAME_CAP = 1800

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid and k.')
  const { grid, k } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIDE) throw new Error(`grid has 1 to ${MAX_SIDE} rows.`)
  const n = Array.isArray(grid[0]) ? grid[0].length : 0
  if (n < 1 || n > MAX_SIDE) throw new Error(`Each row has 1 to ${MAX_SIDE} columns.`)
  if (grid.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('All rows must have the same length.')
  const cells = grid.length * n
  if (!Number.isInteger(k) || k < 1 || k > cells) throw new Error(`k must be between 1 and ${cells}.`)
  const seen = new Set()
  for (const value of grid.flat()) {
    if (!Number.isInteger(value) || value < 0 || value > k) throw new Error(`Grid values must be integers from 0 to ${k}.`)
    if (value > 0) {
      if (seen.has(value)) throw new Error(`${value} appears more than once.`)
      seen.add(value)
    }
  }
  if (seen.size !== k) throw new Error(`Every number from 1 to ${k} must appear exactly once.`)
  return { grid: grid.map(row => [...row]), k }
}

export const python = `def find_path(grid, k):
    m, n = len(grid), len(grid[0])
    seen = [[False] * n for _ in range(m)]
    path = []

    def walk(r, c, need):
        path.append([r, c])
        seen[r][c] = True
        if grid[r][c] == need:
            need += 1
        if len(path) == m * n:
            return True
        for dr, dc in ((-1, 0), (0, 1), (1, 0), (0, -1)):
            x, y = r + dr, c + dc
            if 0 <= x < m and 0 <= y < n and not seen[x][y] and grid[x][y] in (0, need):
                if walk(x, y, need):
                    return True
        seen[r][c] = False
        path.pop()
        return False

    for r in range(m):
        for c in range(n):
            if grid[r][c] in (0, 1) and walk(r, c, 1):
                return path
    return []
`

export const code = `visit every cell once, meeting 1 to k in order
  for each cell as a possible start
    it may start the walk only when it holds 0 or 1
  enter a cell: add it to the path and mark it visited
    if it holds the number needed next, need the following number
    if every cell is on the path, the walk is finished
    for each neighbour: up, right, down, left
      it is open when unvisited and holding 0 or the needed number
      if open, enter it and search from there
    no neighbour led to a full walk: unmark the cell and step back
  no start produced a full walk: return the empty list`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = text => {
  const hit = code.find(line => line.text.includes(text))
  if (!hit) throw new Error(`Missing pseudocode line: ${text}`)
  return hit.line
}
const pyLines = python.split('\n')
const P = text => {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Consider the next cell as the start of the walk.' },
  { id: 'enter', label: 'Enter', description: 'Step onto a cell and mark it visited.' },
  { id: 'number', label: 'Number', description: 'The cell holds the needed number, so the next one is needed now.' },
  { id: 'probe', label: 'Neighbour', description: 'Check whether one neighbour may be entered.' },
  { id: 'back', label: 'Backtrack', description: 'Every way out failed; leave the cell and unmark it.' },
  { id: 'jump', label: 'Long search', description: 'A summary of search steps too numerous to draw one by one.' },
  { id: 'done', label: 'Result', description: 'The finished walk, or the empty list.' },
]

const DIRS = [[-1, 0, 'up'], [0, 1, 'right'], [1, 0, 'down'], [0, -1, 'left']]

export function buildTrace({ grid, k }) {
  const m = grid.length
  const n = grid[0].length
  const total = m * n
  const seen = grid.map(row => row.map(() => false))
  const path = []
  const stack = []
  const frames = []
  let entered = 0
  let backtracks = 0
  let hidden = 0
  const emit = (phase, activeLine, pythonLine, at, need, message, probe = null) => {
    if (frames.length >= FRAME_CAP) { hidden++; return }
    frames.push({
      phase, activeLine, pythonLine, at, need, message, probe,
      path: path.map(cell => [...cell]),
      stack: stack.map(entry => ({ r: entry.r, c: entry.c, options: entry.options.map(option => ({ ...option })) })),
      entered, backtracks,
    })
  }
  const neighbours = (r, c) => DIRS.flatMap(([dr, dc, dir]) => {
    const x = r + dr
    const y = c + dc
    return x >= 0 && x < m && y >= 0 && y < n ? [{ x, y, dir, status: 'untried' }] : []
  })
  function walk(r, c, need) {
    path.push([r, c])
    seen[r][c] = true
    entered++
    const entry = { r, c, options: neighbours(r, c) }
    stack.push(entry)
    emit('enter', L('enter a cell'), P('path.append'), [r, c], need, `Step onto (${r}, ${c}), cell ${path.length} of ${total}.`)
    if (grid[r][c] === need) {
      need++
      emit('number', L('holds the number'), P('need += 1'), [r, c], need, need > k ? `That is number ${need - 1}, the last one. Only 0 cells remain.` : `That is number ${need - 1}; now number ${need} must come next.`)
    }
    if (path.length === total) return true
    for (const option of entry.options) {
      const { x, y } = option
      let verdict
      if (seen[x][y]) verdict = 'visited'
      else if (grid[x][y] !== 0 && grid[x][y] !== need) verdict = 'wrong'
      else verdict = 'open'
      option.status = verdict
      const why = verdict === 'visited' ? `(${x}, ${y}) is already on the path.`
        : verdict === 'wrong' ? `(${x}, ${y}) holds ${grid[x][y]}, but ${need > k ? 'no number' : `number ${need}`} is needed next.`
          : `(${x}, ${y}) is free${grid[x][y] ? ` and holds the needed ${grid[x][y]}` : ''}, so go there.`
      emit('probe', L('it is open'), P('if 0 <= x'), [r, c], need, why, { r: x, c: y, verdict })
      if (verdict === 'open') {
        if (walk(x, y, need)) return true
        option.status = 'dead'
      }
    }
    emit('back', L('no neighbour led'), P('seen[r][c] = False'), [r, c], need, `No way forward from (${r}, ${c}). Unmark it and step back.`)
    seen[r][c] = false
    path.pop()
    stack.pop()
    backtracks++
    return false
  }
  let found = false
  outer: for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const eligible = grid[r][c] === 0 || grid[r][c] === 1
      emit('start', L('it may start'), P('if grid[r][c] in (0, 1)'), [r, c], 1, eligible ? `Try a walk starting at (${r}, ${c}).` : `(${r}, ${c}) holds ${grid[r][c]}, which cannot come before 1, so no walk starts here.`)
      if (eligible && walk(r, c, 1)) { found = true; break outer }
    }
  }
  const result = found ? path.map(cell => [...cell]) : []
  const skipped = hidden
  if (skipped > 0) {
    frames.push({
      phase: 'jump', activeLine: L('for each neighbour'), pythonLine: P('for dr, dc'), at: null, need: 1, probe: null,
      path: [], stack: [], entered, backtracks,
      message: `The search continued for ${skipped} more steps that are not drawn. Totals: ${entered} cells entered, ${backtracks} step-backs.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: found ? L('the walk is finished') : L('no start produced'), pythonLine: found ? P('return path') : P('return []'),
    at: null, need: found ? k + 1 : 1, probe: null,
    path: result, stack: [], entered, backtracks,
    message: found ? `All ${total} cells are covered and 1 to ${k} were met in order.` : `Every start failed after ${entered} cell entries, so the answer is the empty list.`,
  })
  return { input: { grid, k }, result, frames }
}

export const inputLabel = 'Object with grid (rows of integers) and k'
export const complexity = 'Backtracking: the search can try every self-avoiding walk, which is exponential in general and small enough here because the grid side is at most 5. Space is O(mn) for the path and marks. Beyond 1800 frames the search still finishes, and one summary frame reports the undrawn steps.'
export const examples = [
  { label: 'Three numbers', input: '{"grid":[[0,3,0],[0,0,0],[2,0,1]],"k":3}' },
  { label: 'Needs backtracking', input: '{"grid":[[0,0,2],[0,1,0],[0,0,0]],"k":2}' },
  { label: 'No route', input: '{"grid":[[1,2],[3,4]],"k":4}' },
  { label: 'Single cell', input: '{"grid":[[1]],"k":1}' },
  { label: 'Long failed search', input: '{"grid":[[0,0,0,0,3],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,2],[1,0,0,0,4]],"k":4}' },
]
