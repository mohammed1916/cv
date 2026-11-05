export function parseInput(text) {
  const rows = JSON.parse(text)
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 30 || rows.some(r => typeof r !== 'string' || !/^[01]+$/.test(r))) throw new Error('Enter 1–30 rows, each a string of 0s and 1s.')
  if (rows.some(r => r.length !== rows[0].length) || rows[0].length > 30) throw new Error('Every row must have the same length, at most 30.')
  return rows
}

// Flood-fill each island and record its cells relative to its top-left corner. Two islands are the same shape
// when those relative coordinates match, whatever their position.
export function buildTrace(rows) {
  const grid = rows.map(r => r.split(''))
  const R = grid.length, C = grid[0].length
  const seen = Array.from({ length: R }, () => Array(C).fill(false))
  const shapes = new Map()
  const frames = [{ phase: 'start', cell: null, island: [], key: null, shapes: [], activeLine: L('const shapes = new Set()'), pythonLine: P('shapes = set()'), message: 'Scan for unvisited land and flood-fill each island.' }]
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] !== '1' || seen[r][c]) continue
      const island = []
      const stack = [[r, c]]
      seen[r][c] = true
      while (stack.length) {
        const [y, x] = stack.pop()
        island.push([y, x])
        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ny = y + dy, nx = x + dx
          if (ny >= 0 && ny < R && nx >= 0 && nx < C && grid[ny][nx] === '1' && !seen[ny][nx]) {
            seen[ny][nx] = true
            stack.push([ny, nx])
          }
        }
      }
      const minY = Math.min(...island.map(p => p[0])), minX = Math.min(...island.map(p => p[1]))
      const key = island.map(([y, x]) => `${y - minY},${x - minX}`).sort().join(' ')
      shapes.set(key, (shapes.get(key) ?? 0) + 1)
      frames.push({ phase: 'island', cell: [r, c], island: island.map(p => [...p]), key, shapes: [...shapes].map(([k, n]) => ({ key: k, count: n })), activeLine: L('shapes.add(key)'), pythonLine: P('shapes.add(key)'), message: `Island of ${island.length} cell(s) starting at (${r}, ${c}): shape ${shapes.get(key) > 1 ? 'seen before' : 'new'}.` })
    }
  }
  const result = shapes.size
  frames.push({ phase: 'done', cell: null, island: [], key: null, shapes: [...shapes].map(([k, n]) => ({ key: k, count: n })), result, activeLine: L('return shapes.size'), pythonLine: P('return len(shapes)'), message: `${result} distinct shape(s).` })
  return { input: rows, result, frames }
}

const SOURCE = `function numDistinctIslands(grid) {
  const R = grid.length
  const C = grid[0].length
  const seen = Array.from({ length: R }, () => Array(C).fill(false))
  const shapes = new Set()
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] !== '1' || seen[r][c]) continue
      const island = []
      const stack = [[r, c]]
      seen[r][c] = true
      while (stack.length) {
        const [y, x] = stack.pop()
        island.push([y, x])
        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ny = y + dy
          const nx = x + dx
          if (ny >= 0 && ny < R && nx >= 0 && nx < C && grid[ny][nx] === '1' && !seen[ny][nx]) {
            seen[ny][nx] = true
            stack.push([ny, nx])
          }
        }
      }
      const minY = Math.min(...island.map(p => p[0]))
      const minX = Math.min(...island.map(p => p[1]))
      const key = island.map(([y, x]) => \`\${y - minY},\${x - minX}\`).sort().join(' ')
      shapes.add(key)
    }
  }
  return shapes.size
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_distinct_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    shapes = set()
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != '1' or seen[r][c]:
                continue
            island = []
            stack = [(r, c)]
            seen[r][c] = True
            while stack:
                y, x = stack.pop()
                island.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] == '1' and not seen[ny][nx]:
                        seen[ny][nx] = True
                        stack.append((ny, nx))
            min_y = min(p[0] for p in island)
            min_x = min(p[1] for p in island)
            key = tuple(sorted((y - min_y, x - min_x) for y, x in island))
            shapes.add(key)
    return len(shapes)`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
