export function parseInput(text) {
  const moves = JSON.parse(text)
  if (typeof moves !== 'string' || moves.length < 1 || moves.length > 100000 || ![...moves].every(c => 'UDLR'.includes(c))) throw new Error('Enter a JSON string of 1–100,000 characters, each U, D, L or R.')
  return moves
}

export function buildTrace(moves) {
  let x = 0, y = 0
  const frames = [{ phase: 'start', index: -1, x, y, activeLine: 2, message: 'Start at the origin (0, 0).' }]
  const delta = { U: [0, 1], D: [0, -1], L: [-1, 0], R: [1, 0] }
  ;[...moves].forEach((m, i) => {
    x += delta[m][0]; y += delta[m][1]
    frames.push({ phase: 'move', index: i, move: m, x, y, activeLine: 4, message: `Move ${m}: position (${x}, ${y}).` })
  })
  const result = x === 0 && y === 0
  frames.push({ phase: 'done', index: moves.length - 1, x, y, result, activeLine: 6, message: result ? 'Back at the origin.' : `Ends at (${x}, ${y}), not the origin.` })
  return { input: moves, result, frames }
}

export const code = `set horizontal total x and vertical total y to 0
for each move in moves:
  if the move is U or D, change y by one step
  if the move is L or R, change x by one step
return x equals 0 and y equals 0`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Scan trace: activeLine 1 (setup), 4 (update per move), 5 (return).
// Vertical moves are line 3 and horizontal moves are line 4.
export const LINE_MAP = { 1: 1, 4: 4, 5: 5 }

export function familyLine(frame) {
  if (frame.phase === 'update') return /^Move [UD] /.test(frame.message) ? 3 : 4
  return LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def judge_circle(moves):
    x = 0
    y = 0
    for move in moves:
        if move == 'U':
            y += 1
        elif move == 'D':
            y -= 1
        elif move == 'L':
            x -= 1
        elif move == 'R':
            x += 1
    return x == 0 and y == 0`
