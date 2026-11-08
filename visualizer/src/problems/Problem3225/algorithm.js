export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 5) throw new Error('grid is an n x n array with n from 1 to 5 in this visualization.')
  const n = grid.length
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('grid must be square.')
    if (!row.every(v => Number.isInteger(v) && v >= 0 && v <= 99)) throw new Error('Each cell is an integer from 0 to 99.')
  }
  return { grid }
}

// Column j is blacked from the top down to a chosen row, so only its height h[j] matters:
// rows 0..h[j]-1 are black and h[j] = 0 means no operation. A cell (i, j) is white when i >= h[j],
// and it scores when a neighbour column is taller than i.
export function scoreHeights(grid, heights) {
  const n = grid.length
  let total = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i < heights[j]) continue
      const left = j > 0 && i < heights[j - 1]
      const right = j < n - 1 && i < heights[j + 1]
      if (left || right) total += grid[i][j]
    }
  }
  return total
}

export function buildTrace({ grid }) {
  const n = grid.length
  const heights = Array(n).fill(0)
  let best = -1
  let bestHeights = heights.slice()
  const frames = []
  frames.push({ pythonLine: 4, phase: 'start', activeLine: L('try every combination'), heights: heights.slice(), score: null, best: null, message: 'Each column is described by how many rows from the top are black.' })
  const total = (n + 1) ** n
  for (let step = 0; step < total; step++) {
    const score = scoreHeights(grid, heights)
    if (score > best) {
      best = score
      bestHeights = heights.slice()
      frames.push({ pythonLine: 9, phase: 'improve', activeLine: L('keep the best'), heights: heights.slice(), score, best, message: `Heights ${heights.join(', ')} score ${score}.` })
    }
    let k = 0
    while (k < n) {
      heights[k] += 1
      if (heights[k] <= n) break
      heights[k] = 0
      k++
    }
  }
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return the best'), heights: bestHeights, score: best, best, message: `Best score is ${best}.` })
  return { input: { grid }, result: best, frames }
}

export const code = `maximum score after some column operations
  a column is described by its black height, from 0 to n
  try every combination of heights for the columns
    score each white cell that has a black neighbour
    keep the best total
  return the best total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_score(grid):
    n = len(grid)
    best = 0
    for heights in product(range(n + 1), repeat=n):
        total = 0
        for i in range(n):
            for j in range(n):
                if i < heights[j]:
                    continue
                left = j > 0 and i < heights[j - 1]
                right = j < n - 1 and i < heights[j + 1]
                if left or right:
                    total += grid[i][j]
        best = max(best, total)
    return best
`
