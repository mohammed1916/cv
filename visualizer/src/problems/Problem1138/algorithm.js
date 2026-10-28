export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a target string.')
  if (typeof input.target !== 'string' || !/^[a-z]{1,100}$/.test(input.target)) throw new Error('target must be 1 to 100 lowercase letters.')
  return { target: input.target }
}

// The board has five columns; letter i sits at row floor(i / 5), column i mod 5. Only z (row 5) is alone in its row.
const position = ch => {
  const i = ch.charCodeAt(0) - 97
  return { row: Math.floor(i / 5), col: i % 5 }
}

// Moves from (row, col) to the goal. z can only be entered from its own column, so its horizontal moves come first.
function plan(row, col, ch, goal) {
  const up = Math.max(0, row - goal.row)
  const down = Math.max(0, goal.row - row)
  const left = Math.max(0, col - goal.col)
  const right = Math.max(0, goal.col - col)
  const vertical = 'U'.repeat(up) + 'D'.repeat(down)
  const horizontal = 'L'.repeat(left) + 'R'.repeat(right)
  return ch === 'z' ? horizontal + vertical : vertical + horizontal
}

export function buildTrace(input) {
  const { target } = input
  let row = 0
  let col = 0
  let moves = ''
  let typed = ''
  const frames = [{ phase: 'start', activeLine: L('set row and col'), row, col, moves, typed, message: 'Start on the letter a at row 0, column 0.' }]
  for (const ch of target) {
    const goal = position(ch)
    const segment = plan(row, col, ch, goal)
    moves += segment + '!'
    typed += ch
    row = goal.row
    col = goal.col
    frames.push({ phase: 'letter', activeLine: L('add the selection'), row, col, moves, typed, message: `${segment ? `Move ${segment}` : 'Stay put'}, then select ${ch}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return moves'), row, col, moves, typed, message: `The moves spell ${typed}.` })
  return { input, result: moves, frames }
}

export const code = `alphabet board path (target):
  set row and col to 0, which is the letter a
  set moves to an empty string
  for each letter in target
    find the row and column of the letter on the board
    if the letter is z then
      add the left moves, then the up or down moves
    otherwise
      add the up or down moves, then the left or right moves
    add the selection mark !
    set row and col to the letter position
  return moves`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def alphabet_board_path(target):
    row, col = 0, 0
    moves = []
    for ch in target:
        i = ord(ch) - ord('a')
        goal_row, goal_col = divmod(i, 5)
        up = max(0, row - goal_row)
        down = max(0, goal_row - row)
        left = max(0, col - goal_col)
        right = max(0, goal_col - col)
        vertical = 'U' * up + 'D' * down
        horizontal = 'L' * left + 'R' * right
        if ch == 'z':
            moves.append(horizontal + vertical)
        else:
            moves.append(vertical + horizontal)
        moves.append('!')
        row, col = goal_row, goal_col
    return ''.join(moves)
`
