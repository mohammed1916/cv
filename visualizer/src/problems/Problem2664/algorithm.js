// Pseudocode lines are looked up by a phrase, so a renamed line fails loudly instead of pointing at the wrong text.
export const code = `find a knight's tour on a rows by cols board that starts at start
make a board with every cell unlabelled, marked -1
walk(start, 0)
return the labelled board if the walk succeeds, otherwise an empty grid

walk(cell, step):
  label the cell with the step
  if step is the last index then return true
  list the unvisited knight moves from cell with their onward counts
  sort the moves by fewest onward moves first
  for each move in that order
    if walk(move, step plus 1) then return true
  clear the label of cell
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = phrase => {
  const found = code.findIndex(c => c.text.includes(phrase))
  if (found < 0) throw new Error(`Missing pseudocode line for "${phrase}"`)
  return found + 1
}

export const python = `def knight_tour(rows, cols, start):
    board = [[-1] * cols for _ in range(rows)]
    moves = [(1, 2), (2, 1), (2, -1), (1, -2), (-1, -2), (-2, -1), (-2, 1), (-1, 2)]

    def free(r, c):
        return 0 <= r < rows and 0 <= c < cols and board[r][c] == -1

    def onward(r, c):
        return sum(1 for dr, dc in moves if free(r + dr, c + dc))

    def walk(r, c, step):
        board[r][c] = step
        if step == rows * cols - 1:
            return True
        options = []
        for dr, dc in moves:
            nr, nc = r + dr, c + dc
            if free(nr, nc):
                options.append((onward(nr, nc), nr, nc))
        options.sort()
        for _, nr, nc in options:
            if walk(nr, nc, step + 1):
                return True
        board[r][c] = -1
        return False

    if walk(start[0], start[1], 0):
        return board
    return []
`

const pythonLines = python.trim().split('\n')
const PY = phrase => {
  const found = pythonLines.findIndex(t => t.includes(phrase))
  if (found < 0) throw new Error(`Missing Python line for "${phrase}"`)
  return found + 1
}

export const phases = [
  { id: 'place', label: 'Place', description: 'Label the current square with its visit number.' },
  { id: 'options', label: 'Options', description: 'List the unvisited knight moves, fewest onward moves first.' },
  { id: 'try', label: 'Try', description: 'Follow the next candidate move.' },
  { id: 'backtrack', label: 'Back up', description: 'No tour continues from here, so clear the label.' },
  { id: 'found', label: 'Tour', description: 'Every square has a label.' },
  { id: 'done', label: 'Result', description: 'Report the labelled board or the empty grid.' },
]

const MOVES = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with rows, cols and start.')
  const { rows, cols, start } = input
  if (!Number.isInteger(rows) || rows < 1 || rows > 5) throw new Error('rows is an integer from 1 to 5.')
  if (!Number.isInteger(cols) || cols < 1 || cols > 5) throw new Error('cols is an integer from 1 to 5.')
  if (!Array.isArray(start) || start.length !== 2 || !Number.isInteger(start[0]) || !Number.isInteger(start[1])) throw new Error('start is [row, column].')
  if (start[0] < 0 || start[0] >= rows || start[1] < 0 || start[1] >= cols) throw new Error('start must lie on the board.')
  return { rows, cols, start: [start[0], start[1]] }
}

export function buildTrace({ rows, cols, start }) {
  const total = rows * cols
  const board = Array.from({ length: rows }, () => Array(cols).fill(-1))
  const frames = []
  const free = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === -1
  const onward = (r, c) => MOVES.filter(([dr, dc]) => free(r + dr, c + dc)).length
  const push = (phase, line, py, message, extra = {}) => {
    // Backtracking on some starts explores far more than a teaching trace can show, so the trace stops with a clear message.
    if (frames.length >= 20000) throw new Error('This start needs too long a search to visualize. Try a 5 by 5 board or a smaller one.')
    frames.push({
    phase,
    activeLine: L(line),
    pythonLine: PY(py),
    message,
    rows,
    cols,
    start,
    board: board.map(row => [...row]),
    at: extra.at ?? null,
    options: extra.options ?? [],
    chosen: extra.chosen ?? null,
    labelled: board.flat().filter(v => v >= 0).length,
  })
  }

  function walk(r, c, step) {
    board[r][c] = step
    push('place', 'label the cell with the step', 'board[r][c] = step', `Visit ${step} goes to row ${r}, column ${c}.`, { at: [r, c] })
    if (step === total - 1) {
      push('found', 'if step is the last index', 'if step == rows * cols - 1', `Visit ${step} is the last square, so every cell has a label.`, { at: [r, c] })
      return true
    }
    const options = []
    for (const [dr, dc] of MOVES) {
      const nr = r + dr
      const nc = c + dc
      if (free(nr, nc)) options.push({ r: nr, c: nc, onward: onward(nr, nc) })
    }
    options.sort((a, b) => a.onward - b.onward || a.r - b.r || a.c - b.c)
    push('options', 'list the unvisited knight moves', 'options.append', `${options.length} unvisited move${options.length === 1 ? '' : 's'} from row ${r}, column ${c}; fewest onward moves first.`, { at: [r, c], options })
    for (const option of options) {
      push('try', 'for each move in that order', 'for _, nr, nc in options', `Try row ${option.r}, column ${option.c}, which leaves ${option.onward} onward move${option.onward === 1 ? '' : 's'}.`, { at: [option.r, option.c], options, chosen: option })
      if (walk(option.r, option.c, step + 1)) return true
    }
    board[r][c] = -1
    push('backtrack', 'clear the label of cell', 'board[r][c] = -1', `No tour continues from row ${r}, column ${c}, so its label is cleared.`, { at: [r, c] })
    return false
  }

  const ok = walk(start[0], start[1], 0)
  const result = ok ? board.map(row => [...row]) : []
  push('done', 'return the labelled board', 'return board', ok ? 'A tour exists from this start, and the labelled board is returned.' : 'No tour exists from this start, so the result is an empty grid.', { at: null })
  return { input: { rows, cols, start: [...start] }, result, frames }
}
