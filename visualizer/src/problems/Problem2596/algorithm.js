const KNIGHT = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with grid.')
  const { grid } = data
  if (!Array.isArray(grid) || grid.length < 3 || grid.length > 7) throw new Error('grid is an n by n array with 3 to 7 rows.')
  const n = grid.length
  if (grid.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('grid must be square.')
  const flat = grid.flat()
  if (flat.some(v => !Number.isInteger(v) || v < 0 || v >= n * n) || new Set(flat).size !== n * n) {
    throw new Error('grid must hold each of 0 to n squared minus 1 exactly once.')
  }
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const n = grid.length
  const cell = Array(n * n)
  grid.forEach((row, r) => row.forEach((v, c) => { cell[v] = [r, c] }))
  const frames = [{ phase: 'start', activeLine: L('if the top-left cell'), k: 0, from: null, to: cell[0], message: 'The move numbers must start at the top-left cell with 0.' }]
  if (grid[0][0] !== 0) {
    frames.push({ phase: 'fail', activeLine: L('if the top-left cell'), k: 0, from: null, to: cell[0], message: 'The top-left cell is not 0, so this is not a tour.' })
    return { input, result: false, frames }
  }
  for (let k = 0; k < n * n - 1; k++) {
    const [r1, c1] = cell[k]
    const [r2, c2] = cell[k + 1]
    const ok = KNIGHT.some(([dr, dc]) => r1 + dr === r2 && c1 + dc === c2)
    frames.push({ phase: ok ? 'check' : 'fail', activeLine: L('if the cells of k'), k, from: [r1, c1], to: [r2, c2],
      message: ok ? `Move ${k} to ${k + 1} is a knight move.` : `Move ${k} to ${k + 1} is not a knight move, so the grid is not a tour.` })
    if (!ok) return { input, result: false, frames }
  }
  frames.push({ phase: 'done', activeLine: L('return true'), k: n * n - 1, from: null, to: null, message: 'Every consecutive pair of move numbers is a knight move.' })
  return { input, result: true, frames }
}

export const code = `check the knight tour
  if the top-left cell does not hold 0 then return false
  find the cell of every move number
  for each move number k from 0 to n squared minus 2
    if the cells of k and k plus 1 are not a knight move apart then return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def check_knight_tour(grid):
    n = len(grid)
    if grid[0][0] != 0:
        return False
    pos = [None] * (n * n)
    for r in range(n):
        for c in range(n):
            pos[grid[r][c]] = (r, c)
    for k in range(n * n - 1):
        r1, c1 = pos[k]
        r2, c2 = pos[k + 1]
        if sorted([abs(r1 - r2), abs(c1 - c2)]) != [1, 2]:
            return False
    return True
`
