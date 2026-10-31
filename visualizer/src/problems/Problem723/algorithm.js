export function parseInput(text) {
  const board = JSON.parse(text)
  if (!Array.isArray(board) || board.length < 1 || board.length > 8) throw new Error('Use 1 to 8 rows.')
  const width = board[0]?.length ?? 0
  if (width < 1 || width > 8 || board.some(row => !Array.isArray(row) || row.length !== width || row.some(v => !Number.isInteger(v) || v < 0 || v > 5))) {
    throw new Error('Use a rectangular board of integers 0 to 5 (0 = empty), at most 8 by 8.')
  }
  return board
}

const copy = board => board.map(row => [...row])

// Cells in a run of three or more equal non-zero candies, horizontally or vertically.
function crushable(board) {
  const rows = board.length, cols = board[0].length
  const marked = new Set()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = board[r][c]
      if (!v) continue
      if (c + 2 < cols && board[r][c + 1] === v && board[r][c + 2] === v) {
        for (let k = 0; k < 3; k++) marked.add(`${r},${c + k}`)
      }
      if (r + 2 < rows && board[r + 1][c] === v && board[r + 2][c] === v) {
        for (let k = 0; k < 3; k++) marked.add(`${r + k},${c}`)
      }
    }
  }
  return [...marked].map(key => key.split(',').map(Number))
}

// Candies keep their order and fall to the bottom of each column.
function gravity(board) {
  const rows = board.length, cols = board[0].length
  const out = Array.from({ length: rows }, () => Array(cols).fill(0))
  for (let c = 0; c < cols; c++) {
    const column = board.map(row => row[c]).filter(v => v !== 0)
    column.forEach((v, i) => { out[rows - column.length + i][c] = v })
  }
  return out
}

export function buildTrace(start) {
  let board = copy(start)
  const frames = [{ phase: 'start', pythonLine: 2, activeLine: L('set crushed to an empty set'), board: copy(board), crushed: [], round: 0, message: 'Look for three or more equal candies in a row or column.' }]
  let round = 0
  for (;;) {
    const crushed = crushable(board)
    if (crushed.length === 0) break
    round++
    frames.push({ phase: 'mark', pythonLine: 13, activeLine: L('add those three cells to crushed'), board: copy(board), crushed, round, message: `Round ${round}: ${crushed.length} candies are part of a run of three and are crushed.` })
    for (const [r, c] of crushed) board[r][c] = 0
    frames.push({ phase: 'clear', pythonLine: 16, activeLine: L('set each cell in crushed to empty'), board: copy(board), crushed: [], round, message: 'Crushed cells become empty.' })
    board = gravity(board)
    frames.push({ phase: 'drop', pythonLine: 22, activeLine: L('stack the non-empty candies'), board: copy(board), crushed: [], round, message: 'Candies above fall into the empty cells below them.' })
  }
  frames.push({ phase: 'done', pythonLine: 14, activeLine: L('return the board'), board: copy(board), crushed: [], round, message: `Stable after ${round} round(s).` })
  return { input: start, result: board, frames }
}

export const code = `set rows and cols to the board height and width
repeat forever
  set crushed to an empty set
  for each cell (r, c) on the board
    if a non-empty cell matches the next two cells to its right, add those three cells to crushed
    if a non-empty cell matches the next two cells below it, add those three cells to crushed
  if crushed is empty then stop repeating
  set each cell in crushed to empty
  for each column c
    stack the non-empty candies of column c at the bottom, keeping their order
return the board`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def candy_crush(board):
    board = [row[:] for row in board]
    rows, cols = len(board), len(board[0])
    while True:
        crushed = set()
        for r in range(rows):
            for c in range(cols):
                v = board[r][c]
                if v and c + 2 < cols and board[r][c + 1] == v and board[r][c + 2] == v:
                    crushed |= {(r, c), (r, c + 1), (r, c + 2)}
                if v and r + 2 < rows and board[r + 1][c] == v and board[r + 2][c] == v:
                    crushed |= {(r, c), (r + 1, c), (r + 2, c)}
        if not crushed:
            return board
        for r, c in crushed:
            board[r][c] = 0
        for c in range(cols):
            column = [board[r][c] for r in range(rows) if board[r][c]]
            for r in range(rows):
                board[r][c] = 0
            for i, v in enumerate(column):
                board[rows - len(column) + i][c] = v`
const L = s => code.findIndex(c => c.text.includes(s)) + 1
