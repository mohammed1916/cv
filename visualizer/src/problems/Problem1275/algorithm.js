export const phases = [
  { id: 'start', label: 'Empty board', description: 'Start with a 3 by 3 board of empty cells. Player A moves first, then players alternate.' },
  { id: 'place', label: 'Place mark', description: 'Put the current player mark into the chosen cell.' },
  { id: 'check', label: 'Check lines', description: 'Only lines through the new mark can have just become complete: its row, its column and any diagonal it lies on.' },
  { id: 'done', label: 'Result', description: 'Report the winner, a draw on a full board, or a pending game.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"moves": [[0, 0], [1, 1]]}.')
  const { moves } = input
  if (!Array.isArray(moves) || moves.length < 1 || moves.length > 9) throw new Error('moves is a list of 1 to 9 [row, column] pairs.')
  const seen = new Set()
  const board = Array.from({ length: 3 }, () => Array(3).fill(''))
  let won = false
  moves.forEach((move, i) => {
    if (!Array.isArray(move) || move.length !== 2 || !move.every(v => Number.isInteger(v) && v >= 0 && v <= 2)) throw new Error('Each move is a [row, column] pair with values from 0 to 2.')
    const [r, c] = move
    if (won) throw new Error('No moves may follow a winning move.')
    if (seen.has(r * 3 + c)) throw new Error('A cell cannot be played twice.')
    seen.add(r * 3 + c)
    board[r][c] = i % 2 === 0 ? 'A' : 'B'
    won = winnerAt(board, r, c) !== null
  })
  return { moves }
}

function winnerAt(board, r, c) {
  const p = board[r][c]
  if (!p) return null
  const row = board[r].every(v => v === p)
  const col = board.every(line => line[c] === p)
  const diag = r === c && [0, 1, 2].every(k => board[k][k] === p)
  const anti = r + c === 2 && [0, 1, 2].every(k => board[k][2 - k] === p)
  return row || col || diag || anti ? p : null
}

export function buildTrace({ moves }) {
  const board = Array.from({ length: 3 }, () => Array(3).fill(''))
  const copy = () => board.map(row => [...row])
  const frames = [{ phase: 'start', activeLine: L('set board'), pythonLine: P('board = '), snapshot: { board: copy(), move: null, lines: [], winner: null }, message: 'The board is empty. Player A makes the first move.' }]
  let result = null
  for (let i = 0; i < moves.length; i++) {
    const [r, c] = moves[i]
    const player = i % 2 === 0 ? 'A' : 'B'
    board[r][c] = player
    frames.push({ phase: 'place', activeLine: L('place'), pythonLine: P('board[row][col] ='), snapshot: { board: copy(), move: [r, c], lines: [], winner: null }, message: `Move ${i + 1}: ${player} takes row ${r}, column ${c}.` })
    const lines = [`row ${r}`, `column ${c}`]
    if (r === c) lines.push('main diagonal')
    if (r + c === 2) lines.push('anti-diagonal')
    const winner = winnerAt(board, r, c)
    frames.push({ phase: 'check', activeLine: L('if the player completes'), pythonLine: P('if wins('), snapshot: { board: copy(), move: [r, c], lines, winner }, message: winner ? `${lines.join(', ')} is complete for ${winner}.` : `${lines.join(', ')} is not complete, so play continues.` })
    if (winner) { result = winner; break }
  }
  if (!result) result = moves.length === 9 ? 'Draw' : 'Pending'
  frames.push({ phase: 'done', activeLine: L('return'), pythonLine: P("return 'Draw'"), snapshot: { board: copy(), move: null, lines: [], winner: result }, message: result === 'Draw' ? 'All nine cells are filled and no line is complete, so the game is a draw.' : result === 'Pending' ? 'Cells remain and no line is complete, so the game is still pending.' : `${result} completed a line and wins.` })
  return { input: { moves }, result, frames }
}

export const code = `find winner (moves):
  set board to nine empty cells
  for each move i with (row, col):
    player is A on even moves and B on odd moves
    place player at (row, col)
    if the player completes its row, column or a diagonal through (row, col):
      return player
  if the board has nine marks: return Draw
  return Pending`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def tictactoe(moves):
    board = [[' '] * 3 for _ in range(3)]
    for i, (row, col) in enumerate(moves):
        player = 'A' if i % 2 == 0 else 'B'
        board[row][col] = player
        if wins(board, row, col, player):
            return player
    return 'Draw' if len(moves) == 9 else 'Pending'

def wins(board, row, col, player):
    row_done = all(board[row][c] == player for c in range(3))
    col_done = all(board[r][col] == player for r in range(3))
    diag = row == col and all(board[k][k] == player for k in range(3))
    anti = row + col == 2 and all(board[k][2 - k] == player for k in range(3))
    return row_done or col_done or diag or anti
`
