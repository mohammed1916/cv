export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid array.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 7 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 7) throw new Error('grid must be at most 7 by 7.')
  const n = grid[0].length
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 0 || v > 10))) throw new Error('grid must be rectangular, with integers from 0 to 10. Zero is land.')
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const rows = grid.length
  const cols = grid[0].length
  const seen = grid.map(row => row.map(() => false))
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('set best to 0'), members: [], total: 0, best, message: 'Each patch of connected water is one group. Its fish can all be collected.' }]
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0 || seen[r][c]) continue
      seen[r][c] = true
      const stack = [[r, c]]
      const members = []
      let total = 0
      while (stack.length) {
        const [a, b] = stack.pop()
        total += grid[a][b]
        members.push({ row: a, col: b })
        for (const [na, nb] of [[a - 1, b], [a + 1, b], [a, b - 1], [a, b + 1]]) {
          if (na >= 0 && na < rows && nb >= 0 && nb < cols && grid[na][nb] > 0 && !seen[na][nb]) {
            seen[na][nb] = true
            stack.push([na, nb])
          }
        }
      }
      best = Math.max(best, total)
      frames.push({ phase: 'patch', activeLine: L('set the larger'), members, total, best, message: `The patch from (${r}, ${c}) holds ${total} fish. Best so far: ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), members: [], total: best, best, message: `The richest patch holds ${best} fish.` })
  return { input, result: best, frames }
}

export const code = `maximum number of fish (grid):
  set best to 0
  mark every cell as not yet seen
  for each cell in the grid
    if the cell has fish and has not been seen then
      start a stack with this cell and mark it seen
      set total to 0
      while the stack is not empty
        take a cell from the stack and add its fish to total
        push each unseen water neighbor and mark it seen
      set the larger of best and total as the new best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_fish(grid):
    rows, cols = len(grid), len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] > 0 and not seen[r][c]:
                seen[r][c] = True
                stack = [(r, c)]
                total = 0
                while stack:
                    a, b = stack.pop()
                    total += grid[a][b]
                    for na, nb in ((a - 1, b), (a + 1, b), (a, b - 1), (a, b + 1)):
                        if 0 <= na < rows and 0 <= nb < cols and grid[na][nb] > 0 and not seen[na][nb]:
                            seen[na][nb] = True
                            stack.append((na, nb))
                best = max(best, total)
    return best
`
