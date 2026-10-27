export function parseInput(text) {
  const rows = JSON.parse(text)
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 10) throw new Error('Use 1 to 10 rows.')
  const width = rows[0]?.length ?? 0
  if (width < 1 || width > 10 || rows.some(row => typeof row !== 'string' || row.length !== width || !/^[01]+$/.test(row))) {
    throw new Error('Each row is a string of 0s and 1s, all the same length (at most 10).')
  }
  return rows
}

const MOVES = [[-1, 0, 'u'], [1, 0, 'd'], [0, -1, 'l'], [0, 1, 'r']]

export function buildTrace(rows) {
  const height = rows.length, width = rows[0].length
  const grid = rows.map(row => [...row].map(Number))
  const land = (r, c) => r >= 0 && c >= 0 && r < height && c < width && grid[r][c] === 1
  const seen = Array.from({ length: height }, () => Array(width).fill(false))
  const shapes = new Set()
  const frames = [{ phase: 'start', activeLine: L('seen = set of visited cells'), cell: null, island: [], shape: null, shapes: 0, message: 'Scan the grid. Each unseen land cell starts a new island.' }]
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (!land(r, c) || seen[r][c]) continue
      const island = []
      let walk = ''
      // Record every step taken and every step back, so the walk is a fingerprint of the shape.
      const explore = (y, x, step) => {
        seen[y][x] = true
        island.push([y, x])
        walk += step
        frames.push({ phase: 'explore', activeLine: L('mark cell seen'), cell: [y, x], island: [...island], shape: walk, shapes: shapes.size, message: `Visit (${y + 1}, ${x + 1}) on the walk from the island’s first cell.` })
        for (const [dy, dx, letter] of MOVES) {
          if (land(y + dy, x + dx) && !seen[y + dy][x + dx]) explore(y + dy, x + dx, letter)
        }
        walk += 'b'
      }
      explore(r, c, 'o')
      const isNew = !shapes.has(walk)
      shapes.add(walk)
      frames.push({ phase: isNew ? 'new' : 'repeat', activeLine: L('add the joined walk'), cell: [r, c], island: [...island], shape: walk, shapes: shapes.size, message: isNew ? `A new shape: the island from (${r + 1}, ${c + 1}) was not seen before.` : `This island repeats a shape already counted.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the number of distinct walks'), cell: null, island: [], shape: null, shapes: shapes.size, message: `${shapes.size} distinct shape(s).` })
  return { input: rows, grid, result: shapes.size, frames }
}

export const code = `define explore(cell, step): mark cell seen and append step to walk
  for each neighbor in the order up, down, left, right
    if the neighbor is unseen land, explore it with its direction letter
  append b to walk, a step back
seen = set of visited cells, shapes = set of walks
for each cell in row-major order
  if the cell is unseen land, start a new island here
    walk = empty list
    explore(cell, o)
    add the joined walk to shapes
return the number of distinct walks in shapes`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_distinct_islands(grid):
    height, width = len(grid), len(grid[0])
    seen = set()
    shapes = set()

    def explore(r, c, step, path):
        seen.add((r, c))
        path.append(step)
        for dr, dc, letter in ((-1, 0, 'u'), (1, 0, 'd'), (0, -1, 'l'), (0, 1, 'r')):
            nr, nc = r + dr, c + dc
            if 0 <= nr < height and 0 <= nc < width and grid[nr][nc] == '1' and (nr, nc) not in seen:
                explore(nr, nc, letter, path)
        path.append('b')

    for r in range(height):
        for c in range(width):
            if grid[r][c] == '1' and (r, c) not in seen:
                path = []
                explore(r, c, 'o', path)
                shapes.add(''.join(path))
    return len(shapes)
`