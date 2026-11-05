// LeetCode 2132: Stamping the Grid.
// A stamp may sit at a top-left corner only if its rectangle contains no occupied cell. A 2D prefix sum of
// occupied cells checks each rectangle in O(1). Every valid placement adds +1 to a difference array;
// a second prefix pass turns that into a coverage count. The grid is stampable when every empty cell has
// coverage above zero.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"grid":[[0,0],[0,0]],"stampHeight":2,"stampWidth":1}.') }
  const { grid, stampHeight, stampWidth } = data ?? {}
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8) throw new Error('grid has 1 to 8 rows.')
  const width = grid[0].length
  if (!width || width > 8 || grid.some(row => !Array.isArray(row) || row.length !== width || row.some(v => v !== 0 && v !== 1))) {
    throw new Error('Every row must have the same length (at most 8) and hold only 0 or 1.')
  }
  const m = grid.length
  const n = width
  if (!Number.isInteger(stampHeight) || !Number.isInteger(stampWidth) || stampHeight < 1 || stampWidth < 1 || stampHeight > m || stampWidth > n) {
    throw new Error('The stamp must fit inside the grid (at least 1 by 1).')
  }
  return { grid, stampHeight, stampWidth }
}

export const code = `function possibleToStamp(grid, stampHeight, stampWidth) {
  const m = grid.length
  const n = grid[0].length
  const occupied = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      occupied[i + 1][j + 1] = grid[i][j] + occupied[i][j + 1] + occupied[i + 1][j] - occupied[i][j]
    }
  }
  const diff = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let r = 0; r + stampHeight <= m; r++) {
    for (let c = 0; c + stampWidth <= n; c++) {
      const inside = occupied[r + stampHeight][c + stampWidth] - occupied[r][c + stampWidth]
        - occupied[r + stampHeight][c] + occupied[r][c]
      if (inside !== 0) continue
      diff[r][c]++
      diff[r][c + stampWidth]--
      diff[r + stampHeight][c]--
      diff[r + stampHeight][c + stampWidth]++
    }
  }
  const cover = Array.from({ length: m }, () => new Array(n).fill(0))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      cover[i][j] = diff[i][j] + (i > 0 ? cover[i - 1][j] : 0) + (j > 0 ? cover[i][j - 1] : 0)
        - (i > 0 && j > 0 ? cover[i - 1][j - 1] : 0)
      if (grid[i][j] === 0 && cover[i][j] === 0) return false
    }
  }
  return true
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: possible_to_stamp
def possible_to_stamp(grid, stampHeight, stampWidth):
    m = len(grid)
    n = len(grid[0])
    occupied = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            occupied[i + 1][j + 1] = grid[i][j] + occupied[i][j + 1] + occupied[i + 1][j] - occupied[i][j]
    diff = [[0] * (n + 1) for _ in range(m + 1)]
    for r in range(m - stampHeight + 1):
        for c in range(n - stampWidth + 1):
            inside = (occupied[r + stampHeight][c + stampWidth] - occupied[r][c + stampWidth]
                      - occupied[r + stampHeight][c] + occupied[r][c])
            if inside != 0:
                continue
            diff[r][c] += 1
            diff[r][c + stampWidth] -= 1
            diff[r + stampHeight][c] -= 1
            diff[r + stampHeight][c + stampWidth] += 1
    cover = [[0] * n for _ in range(m)]
    for i in range(m):
        for j in range(n):
            cover[i][j] = diff[i][j] + (cover[i - 1][j] if i > 0 else 0) + (cover[i][j - 1] if j > 0 else 0) \
                - (cover[i - 1][j - 1] if i > 0 and j > 0 else 0)
            if grid[i][j] == 0 and cover[i][j] == 0:
                return False
    return True
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'prefix', label: 'Occupied counts', description: 'Prefix sums count occupied cells in any rectangle.' },
  { id: 'place', label: 'Valid stamp', description: 'A stamp position is valid when its rectangle holds no occupied cell.' },
  { id: 'cover', label: 'Coverage', description: 'Every empty cell must be inside at least one valid stamp.' },
  { id: 'done', label: 'Result', description: 'Whether all empty cells can be covered.' },
]

export function buildTrace({ grid, stampHeight, stampWidth }) {
  const frames = []
  const m = grid.length
  const n = grid[0].length
  const occupied = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) occupied[i + 1][j + 1] = grid[i][j] + occupied[i][j + 1] + occupied[i + 1][j] - occupied[i][j]
  frames.push({ phase: 'prefix', activeLine: L('const occupied = Array'), pythonLine: P('occupied = [[0]'), message: 'Prefix sums of occupied cells are ready.', grid, stamp: null, current: null, covered: [], result: null })
  const diff = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  const valid = []
  for (let r = 0; r + stampHeight <= m; r++) {
    for (let c = 0; c + stampWidth <= n; c++) {
      const inside = occupied[r + stampHeight][c + stampWidth] - occupied[r][c + stampWidth] - occupied[r + stampHeight][c] + occupied[r][c]
      if (inside !== 0) {
        frames.push({ phase: 'place', activeLine: L('if (inside !== 0)'), pythonLine: P('if inside != 0'), message: `Stamp at (${r}, ${c}) covers an occupied cell; skip it.`, grid, stamp: null, current: [r, c], covered: [], result: null })
        continue
      }
      valid.push([r, c])
      diff[r][c]++
      diff[r][c + stampWidth]--
      diff[r + stampHeight][c]--
      diff[r + stampHeight][c + stampWidth]++
      const stamp = []
      for (let i = r; i < r + stampHeight; i++) for (let j = c; j < c + stampWidth; j++) stamp.push([i, j])
      frames.push({ phase: 'place', activeLine: L('diff[r][c]++'), pythonLine: P('diff[r][c] += 1'), message: `Stamp at (${r}, ${c}) is clear; it may be used.`, grid, stamp, current: [r, c], covered: [], result: null })
    }
  }
  const cover = Array.from({ length: m }, () => new Array(n).fill(0))
  let ok = true
  let blocker = null
  for (let i = 0; i < m && ok; i++) {
    for (let j = 0; j < n; j++) {
      cover[i][j] = diff[i][j] + (i > 0 ? cover[i - 1][j] : 0) + (j > 0 ? cover[i][j - 1] : 0) - (i > 0 && j > 0 ? cover[i - 1][j - 1] : 0)
      if (grid[i][j] === 0 && cover[i][j] === 0) { ok = false; blocker = [i, j]; break }
    }
  }
  const covered = []
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (cover[i][j] > 0) covered.push([i, j])
  frames.push({ phase: 'cover', activeLine: L('if (grid[i][j] === 0'), pythonLine: P('if grid[i][j] == 0'), message: ok ? 'Every empty cell is inside a valid stamp.' : `Cell (${blocker[0]}, ${blocker[1]}) is empty but no valid stamp covers it.`, grid, stamp: null, current: blocker, covered, result: ok })
  frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: P('return True'), message: ok ? 'The stamps can cover every empty cell.' : 'The stamps cannot cover every empty cell.', grid, stamp: null, current: null, covered, result: ok })
  return { input: { grid, stampHeight, stampWidth }, result: ok, frames }
}
