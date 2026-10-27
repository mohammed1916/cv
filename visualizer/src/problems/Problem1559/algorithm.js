export function parseInput(text) {
  const input = JSON.parse(text)
  const grid = input?.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('Use a grid of 1 to 6 rows.')
  const cols = typeof grid[0] === 'string' ? grid[0].length : 0
  if (cols < 1 || cols > 6) throw new Error('Each row needs 1 to 6 letters.')
  if (grid.some(row => typeof row !== 'string' || row.length !== cols || !/^[a-z]+$/.test(row))) {
    throw new Error('Every row must have the same length and hold lowercase letters a to z.')
  }
  return { grid }
}

export function buildTrace({ grid }) {
  const rows = grid.length
  const cols = grid[0].length
  const id = (r, c) => r * cols + c
  const total = rows * cols
  const names = Array.from({ length: total }, (_, i) => `(${Math.floor(i / cols)},${i % cols})`)
  const parent = Array.from({ length: total }, (_, i) => i)
  const size = Array(total).fill(1)
  const find = x => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  const snap = (pair, found, message) => ({ parent: [...parent], size: [...size], pair, found, message })
  const frames = [{ phase: 'start', activeLine: L('give every cell its own set'), ...snap(null, false, 'Every cell starts alone. Only neighbours with the same letter may join.') }]

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= rows || nc >= cols || grid[nr][nc] !== grid[r][c]) continue
        const a = find(id(r, c))
        const b = find(id(nr, nc))
        const pair = [id(r, c), id(nr, nc)]
        if (a === b) {
          frames.push({ phase: 'cycle', activeLine: L('if the two cells are already in the same set'), ...snap(pair, true, `Cells ${names[pair[0]]} and ${names[pair[1]]} are already connected, so the loop closes a cycle.`) })
          frames.push({ phase: 'done', activeLine: L('return true'), ...snap(null, true, 'A cycle of equal letters exists.') })
          return { input: { grid }, result: true, frames }
        }
        if (size[a] < size[b]) {
          parent[a] = b
          size[b] += size[a]
        } else {
          parent[b] = a
          size[a] += size[b]
        }
        frames.push({ phase: 'join', activeLine: L('join the two sets'), ...snap(pair, false, `Join ${names[pair[0]]} and ${names[pair[1]]} (letter ${grid[r][c]}).`) })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), ...snap(null, false, 'No join ever closed a loop, so there is no cycle.') })
  return { input: { grid }, result: false, frames }
}

export const code = `detect a cycle of equal letters in the grid
  give every cell its own set
  for each cell in row-major order
    for its right neighbour and its lower neighbour, if they hold the same letter
      if the two cells are already in the same set then
        return true
      join the two sets
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def contains_cycle(grid):
    rows = len(grid)
    cols = len(grid[0])
    parent = list(range(rows * cols))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for r in range(rows):
        for c in range(cols):
            for dr, dc in ((0, 1), (1, 0)):
                nr = r + dr
                nc = c + dc
                if nr < rows and nc < cols and grid[nr][nc] == grid[r][c]:
                    a = find(r * cols + c)
                    b = find(nr * cols + nc)
                    if a == b:
                        return True
                    parent[a] = b
    return False
`
