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
  const frames = [{ phase: 'start', activeLine: L('shapes = set()'), cell: null, island: [], shape: null, shapes: 0, message: 'Scan the grid. Each unseen land cell starts a new island.' }]
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
        frames.push({ phase: 'explore', activeLine: L('path.append(step)'), cell: [y, x], island: [...island], shape: walk, shapes: shapes.size, message: `Visit (${y + 1}, ${x + 1}) on the walk from the island’s first cell.` })
        for (const [dy, dx, letter] of MOVES) {
          if (land(y + dy, x + dx) && !seen[y + dy][x + dx]) explore(y + dy, x + dx, letter)
        }
        walk += 'b'
      }
      explore(r, c, 'o')
      const isNew = !shapes.has(walk)
      shapes.add(walk)
      frames.push({ phase: isNew ? 'new' : 'repeat', activeLine: L('shapes.add('), cell: [r, c], island: [...island], shape: walk, shapes: shapes.size, message: isNew ? `A new shape: the island from (${r + 1}, ${c + 1}) was not seen before.` : `This island repeats a shape already counted.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return len(shapes)'), cell: null, island: [], shape: null, shapes: shapes.size, message: `${shapes.size} distinct shape(s).` })
  return { input: rows, grid, result: shapes.size, frames }
}

export const code = `def numDistinctIslands(grid):
    seen = set()
    shapes = set()
    def explore(r, c, step, path):
        seen.add((r, c))
        path.append(step)
        for dr, dc, letter in ((-1, 0, 'u'), (1, 0, 'd'), (0, -1, 'l'), (0, 1, 'r')):
            nr, nc = r + dr, c + dc
            if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] == 1 and (nr, nc) not in seen:
                explore(nr, nc, letter, path)
        path.append('b')
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == 1 and (r, c) not in seen:
                path = []
                explore(r, c, 'o', path)
                shapes.add(''.join(path))
    return len(shapes)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
