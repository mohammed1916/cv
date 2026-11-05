export function parseInput(text) {
  const moves = JSON.parse(text)
  if (typeof moves !== 'string' || moves.length > 40 || ![...moves].every(c => 'UDLR'.includes(c))) throw new Error('Enter a JSON string of up to 40 moves, each U, D, L or R.')
  return moves
}

// Track the position after each move. The robot is back at the origin exactly when the up and down moves
// cancel and the left and right moves cancel.
export function buildTrace(moves) {
  let x = 0
  let y = 0
  const path = [[0, 0]]
  const frames = [{ phase: 'start', move: null, x, y, path: path.map(p => [...p]), activeLine: L('let x = 0'), pythonLine: P('x = y = 0'), message: 'Start at the origin (0, 0).' }]
  for (const move of moves) {
    if (move === 'U') y++
    else if (move === 'D') y--
    else if (move === 'L') x--
    else if (move === 'R') x++
    path.push([x, y])
    frames.push({ phase: 'move', move, x, y, path: path.map(p => [...p]), activeLine: L(`move === '${move}'`), pythonLine: P(`move == '${move}'`),message: `Move ${move}: now at (${x}, ${y}).` })
  }
  const result = x === 0 && y === 0
  frames.push({ phase: 'done', move: null, x, y, path: path.map(p => [...p]), result, activeLine: L('return x === 0'), pythonLine: P('return x == 0'), message: result ? 'Back at the origin.' : `Ended at (${x}, ${y}), not the origin.` })
  return { input: moves, result, frames }
}

const SOURCE = `function judgeCircle(moves) {
  let x = 0
  let y = 0
  for (const move of moves) {
    if (move === 'U') y++
    else if (move === 'D') y--
    else if (move === 'L') x--
    else if (move === 'R') x++
  }
  return x === 0 && y === 0
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def judge_circle(moves):
    x = y = 0
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
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
