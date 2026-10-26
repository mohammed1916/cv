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

export const code = `def judgeCircle(moves):
    x = y = 0
    for m in moves:
        if m == 'U': y += 1
        elif m == 'D': y -= 1
        elif m == 'L': x -= 1
        else: x += 1
    return x == 0 and y == 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
