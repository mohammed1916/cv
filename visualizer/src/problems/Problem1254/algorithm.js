export const phases = [
  { id: 'start', label: 'Start', description: 'Read the grid: 0 is land and 1 is water. Nothing is marked as reached yet.' },
  { id: 'border', label: 'Flood from the edge', description: 'Any land connected to the outer ring can walk off the grid, so it is never enclosed. Flood all of it first.' },
  { id: 'interior', label: 'Find enclosed islands', description: 'Each unreached land cell starts a new island. The flood never touches the edge, so the island is enclosed and counts.' },
  { id: 'done', label: 'Complete', description: 'Return how many islands are fully enclosed by water.' },
]

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 10) throw new Error('Enter a JSON array of 1 to 10 rows.')
  if (!Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 10) throw new Error('Each row must hold 1 to 10 cells.')
  const width = grid[0].length
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== width || !row.every(v => v === 0 || v === 1)) {
      throw new Error('Every row must have the same length, and each cell must be 0 (land) or 1 (water).')
    }
  }
  return grid
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

const STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export function buildTrace(grid) {
  const m = grid.length
  const n = grid[0].length
  const reach = Array.from({ length: m }, () => Array(n).fill(false))
  const onEdge = (r, c) => r === 0 || c === 0 || r === m - 1 || c === n - 1
  const snap = (extra = {}) => ({ grid, reach: reach.map(row => [...row]), m, n, ...extra })
  const frames = [{
    phase: 'start', activeLine: L('const reach = Array.from'), pythonLine: P('reach = [[False]'), snapshot: snap(),
    message: `A ${m} by ${n} grid. Land is 0 and water is 1. A closed island is land that never reaches the outer edge.`,
  }]

  // Flood one land component from (sr, sc). Returns whether it reaches the edge.
  function flood(sr, sc, phase) {
    const queue = [[sr, sc]]
    reach[sr][sc] = true
    let touches = false
    for (let head = 0; head < queue.length; head++) {
      const [r, c] = queue[head]
      if (onEdge(r, c)) touches = true
      frames.push({
        phase, activeLine: L('const [y, x] = queue[head]'), pythonLine: P('r, c = queue[head]'),
        snapshot: snap({ focus: [r, c], touches }),
        message: phase === 'border'
          ? `Land cell (${r}, ${c}) is reachable from the edge, so it cannot be enclosed.`
          : `Flood cell (${r}, ${c}). ${touches ? 'This island already reaches the edge, so it will not count.' : 'Nothing so far touches the edge.'}`,
      })
      for (const [dr, dc] of STEPS) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nc < 0 || nr >= m || nc >= n || grid[nr][nc] !== 0 || reach[nr][nc]) continue
        reach[nr][nc] = true
        queue.push([nr, nc])
      }
    }
    return touches
  }

  frames.push({
    phase: 'border', activeLine: L('if ((r === 0 || r === m - 1'), pythonLine: P('if (r in (0, m - 1)'), snapshot: snap(),
    message: 'Sweep the outer ring. Each land cell found there starts a flood that marks everything it can reach.',
  })
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (onEdge(r, c) && grid[r][c] === 0 && !reach[r][c]) flood(r, c, 'border')
    }
  }

  let count = 0
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== 0 || reach[r][c]) continue
      const touches = flood(r, c, 'interior')
      if (!touches) count++
      frames.push({
        phase: 'interior', activeLine: L('!flood(r, c)'), pythonLine: P('if not touches:'),
        snapshot: snap({ island: [r, c], count }),
        message: touches
          ? `The island from (${r}, ${c}) reaches the edge, so it is not counted.`
          : `The island from (${r}, ${c}) never reaches the edge. It is enclosed, so the count is ${count}.`,
      })
    }
  }

  frames.push({
    phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), snapshot: snap({ count }),
    message: `Return ${count}: the number of enclosed land islands.`,
  })
  return { input: grid, result: count, frames }
}

export const code = [
  "function closedIsland(grid) {",
  "  const m = grid.length",
  "  const n = grid[0].length",
  "  const reach = Array.from({ length: m }, () => Array(n).fill(false))",
  "  const flood = (r, c) => {",
  "    const queue = [[r, c]]",
  "    reach[r][c] = true",
  "    let touches = false",
  "    for (let head = 0; head < queue.length; head++) {",
  "      const [y, x] = queue[head]",
  "      if (y === 0 || y === m - 1 || x === 0 || x === n - 1) touches = true",
  "      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {",
  "        const nr = y + dr",
  "        const nc = x + dc",
  "        if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 0 && !reach[nr][nc]) {",
  "          reach[nr][nc] = true",
  "          queue.push([nr, nc])",
  "        }",
  "      }",
  "    }",
  "    return touches",
  "  }",
  "  for (let r = 0; r < m; r++) {",
  "    for (let c = 0; c < n; c++) {",
  "      if ((r === 0 || r === m - 1 || c === 0 || c === n - 1) && grid[r][c] === 0 && !reach[r][c]) flood(r, c)",
  "    }",
  "  }",
  "  let count = 0",
  "  for (let r = 0; r < m; r++) {",
  "    for (let c = 0; c < n; c++) {",
  "      if (grid[r][c] === 0 && !reach[r][c] && !flood(r, c)) count += 1",
  "    }",
  "  }",
  "  return count",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def closed_islands(grid):
    m, n = len(grid), len(grid[0])
    reach = [[False] * n for _ in range(m)]
    def flood(r, c):
        queue = [(r, c)]
        reach[r][c] = True
        touches = False
        head = 0
        while head < len(queue):
            r, c = queue[head]
            head += 1
            if r in (0, m - 1) or c in (0, n - 1):
                touches = True
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 0 and not reach[nr][nc]:
                    reach[nr][nc] = True
                    queue.append((nr, nc))
        return touches
    for r in range(m):
        for c in range(n):
            if (r in (0, m - 1) or c in (0, n - 1)) and grid[r][c] == 0 and not reach[r][c]:
                flood(r, c)
    count = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 0 and not reach[r][c]:
                touches = flood(r, c)
                if not touches:
                    count += 1
    return count
`
