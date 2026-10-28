export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid array.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 3 || grid.length > 7) throw new Error('grid must be a square matrix with 3 to 7 rows.')
  if (grid.some(row => !Array.isArray(row) || row.length !== grid.length || row.some(v => !Number.isInteger(v) || v < 1 || v > 100))) throw new Error('grid must be square, with integers from 1 to 100.')
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const size = grid.length - 2
  const answer = Array.from({ length: size }, () => Array(size).fill(''))
  const frames = [{ phase: 'start', activeLine: L('set size to'), answer: answer.map(r => [...r]), top: -1, left: -1, message: `The answer is ${size} by ${size}, one entry per 3 by 3 window.` }]
  for (let top = 0; top < size; top++) {
    for (let left = 0; left < size; left++) {
      let best = 0
      for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) best = Math.max(best, grid[top + dr][left + dc])
      answer[top][left] = best
      frames.push({ phase: 'window', activeLine: L('find the largest value'), answer: answer.map(r => [...r]), top, left, message: `The window at (${top}, ${left}) has largest value ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), answer: answer.map(r => [...r]), top: -1, left: -1, message: 'Every window has been checked.' })
  return { input, result: answer, frames }
}

export const code = `largest local values (grid):
  set size to the number of rows minus 2
  create an empty answer of size by size
  for each top row from 0 to size minus 1
    for each left column from 0 to size minus 1
      find the largest value in the 3 by 3 block at this corner
      store that maximum in the answer at this position
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_local(grid):
    size = len(grid) - 2
    answer = [[0] * size for _ in range(size)]
    for top in range(size):
        for left in range(size):
            answer[top][left] = max(grid[top + dr][left + dc] for dr in range(3) for dc in range(3))
    return answer
`
