// Design Snake Game. The snake starts at [0, 0] with length 1. Each move returns the score (food eaten so far),
// or -1 when the head leaves the grid or runs into the body, and the game ends.
export const DIRS = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object') throw new Error('Use an object with width, height, food and moves.')
  const { width, height, food, moves } = input
  if (!Number.isInteger(width) || width < 1 || width > 4 || !Number.isInteger(height) || height < 1 || height > 4) throw new Error('width and height are integers from 1 to 4.')
  if (!Array.isArray(food) || food.length > 4 || food.some(f => !Array.isArray(f) || f.length !== 2 || !Number.isInteger(f[0]) || !Number.isInteger(f[1]) || f[0] < 0 || f[0] >= height || f[1] < 0 || f[1] >= width)) throw new Error('food has up to 4 [row, col] cells inside the grid, in the order they appear.')
  if (!Array.isArray(moves) || moves.length < 1 || moves.length > 10 || moves.some(m => !(m in DIRS))) throw new Error('moves has 1 to 10 entries, each U, D, L or R.')
  return { width, height, food, moves }
}

export const CODE_LINES = [
  'class SnakeGame:',
  '    def __init__(self, width, height, food):',
  '        self.body = deque([(0, 0)])',
  '        self.food = food',
  '        self.score = 0',
  '    def move(self, direction):',
  '        head = self.body[0]',
  '        next_cell = (head[0] + dr, head[1] + dc)',
  '        eats = self.food and next_cell == self.food[0]',
  '        if not inside(next_cell): return -1',
  '        if not eats: self.body.pop()',
  '        if next_cell in self.body: return -1',
  '        if eats: self.food.pop(0); self.score += 1',
  '        self.body.appendleft(next_cell)',
  '        return self.score',
]
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = CODE_LINES.join('\n') + '\n'

export function buildTrace({ width, height, food, moves }) {
  let body = [[0, 0]]
  let score = 0
  let foodIndex = 0
  const results = []
  const frames = [{ phase: 'start', activeLine: 3, body: body.map(c => [...c]), food: food.map(c => [...c]), next: null, score, result: null, message: 'The snake starts at the top-left cell with length 1.' }]
  for (const move of moves) {
    const [dr, dc] = DIRS[move]
    const head = body[0]
    const next = [head[0] + dr, head[1] + dc]
    const eats = foodIndex < food.length && food[foodIndex][0] === next[0] && food[foodIndex][1] === next[1]
    frames.push({ phase: 'move', activeLine: 8, body: body.map(c => [...c]), food: food.map(c => [...c]), next, score, result: null, move, message: `Move ${move}: the head moves to [${next}].` })
    if (next[0] < 0 || next[0] >= height || next[1] < 0 || next[1] >= width) {
      results.push(-1)
      frames.push({ phase: 'lose', activeLine: 10, body: body.map(c => [...c]), food: food.map(c => [...c]), next, score, result: -1, move, message: 'The head leaves the grid. The game is over, and the move returns -1.' })
      break
    }
    // The tail leaves its cell first unless the snake eats, so the head may move into the cell the tail just vacated.
    const newBody = eats ? [next, ...body] : [next, ...body.slice(0, -1)]
    if (eats) { foodIndex++; score++ }
    const hitsBody = newBody.slice(1).some(([r, c]) => r === next[0] && c === next[1])
    if (hitsBody) {
      results.push(-1)
      frames.push({ phase: 'lose', activeLine: 12, body: body.map(c => [...c]), food: food.map(c => [...c]), next, score, result: -1, move, message: 'The head runs into the body. The game is over, and the move returns -1.' })
      break
    }
    body = newBody
    results.push(score)
    frames.push({ phase: eats ? 'eat' : 'slide', activeLine: eats ? 13 : 11, body: body.map(c => [...c]), food: food.map(c => [...c]), next, score, result: score, move, message: eats ? `The head reaches food. Score ${score}; the snake grows.` : `The head moves, the tail follows. Score ${score}.` })
  }
  frames.push({ phase: 'done', activeLine: 15, body: body.map(c => [...c]), food: food.map(c => [...c]), next: null, score, result: null, message: `Results: [${results.join(', ')}].` })
  return { input: { width, height, food, moves }, result: results, frames }
}
