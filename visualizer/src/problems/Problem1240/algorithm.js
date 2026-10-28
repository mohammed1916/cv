export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n) || !Number.isInteger(input.m) || input.n < 1 || input.m < 1 || input.n > 8 || input.m > 8) throw new Error('Use {"n": rows, "m": columns} with both from 1 to 8.')
  return { n: input.n, m: input.m }
}

const copy = grid => grid.map(row => [...row])

export function buildTrace({ n, m }) {
  const grid = Array.from({ length: n }, () => Array(m).fill(0))
  let best = n * m
  let placed = 0
  const frames = [{ phase: 'start', activeLine: L('set best to n times m'), grid: copy(grid), placed, best, message: `Start with ${best} unit squares as the best tiling.` }]
  const fits = (r, c, s) => {
    if (r + s > n || c + s > m) return false
    for (let i = r; i < r + s; i++) for (let j = c; j < c + s; j++) if (grid[i][j] !== 0) return false
    return true
  }
  const fill = (r, c, s, value) => {
    for (let i = r; i < r + s; i++) for (let j = c; j < c + s; j++) grid[i][j] = value
  }
  const search = () => {
    let cell = null
    for (let r = 0; r < n && cell === null; r++) for (let c = 0; c < m && cell === null; c++) if (grid[r][c] === 0) cell = [r, c]
    if (cell === null) {
      if (placed < best) {
        best = placed
        frames.push({ phase: 'improve', activeLine: L('set best to the count'), grid: copy(grid), placed, best, message: `Every cell is covered with ${placed} squares, a new best.` })
      }
      return
    }
    const [r, c] = cell
    let largest = 0
    while (fits(r, c, largest + 1)) largest++
    for (let s = largest; s >= 1; s--) {
      if (placed + 1 >= best) continue
      placed++
      fill(r, c, s, placed)
      frames.push({ phase: 'place', activeLine: L('place the square and add one'), grid: copy(grid), placed, best, message: `Place a ${s}x${s} square with its corner at row ${r}, column ${c}.` })
      search()
      fill(r, c, s, 0)
      placed--
    }
  }
  search()
  frames.push({ phase: 'done', activeLine: L('return best'), grid: copy(grid), placed, best, message: `Fewest squares: ${best}.` })
  return { input: { n, m }, result: best, frames }
}

export const code = `fewest squares to tile an n by m rectangle
  set best to n times m, which is all unit squares
  call search with no squares placed
  return best

search()
  find the first empty cell in reading order
  if no empty cell is left then
    set best to the count if the count is below best
    stop
  find the largest square that fits with its corner on that cell
  for each size from largest down to 1
    skip this size if one more square would not beat best
    place the square and add one to the count
    call search
    remove the square and take one away from the count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def fewest_squares(n, m):
    grid = [[0] * m for _ in range(n)]
    best = n * m
    placed = 0

    def fits(r, c, s):
        if r + s > n or c + s > m:
            return False
        return all(grid[i][j] == 0 for i in range(r, r + s) for j in range(c, c + s))

    def fill(r, c, s, value):
        for i in range(r, r + s):
            for j in range(c, c + s):
                grid[i][j] = value

    def search():
        nonlocal best, placed
        empty = next(((r, c) for r in range(n) for c in range(m) if grid[r][c] == 0), None)
        if empty is None:
            best = min(best, placed)
            return
        r, c = empty
        largest = 0
        while fits(r, c, largest + 1):
            largest += 1
        for s in range(largest, 0, -1):
            if placed + 1 >= best:
                continue
            placed += 1
            fill(r, c, s, placed)
            search()
            fill(r, c, s, 0)
            placed -= 1

    search()
    return best
`
