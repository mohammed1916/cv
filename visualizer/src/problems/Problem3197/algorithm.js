export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('Enter a grid of 1 to 6 rows.')
  const cols = grid[0]?.length ?? 0
  if (cols < 1 || cols > 6) throw new Error('Each row has 1 to 6 cells.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== cols || !row.every(v => v === 0 || v === 1)) throw new Error('Cells are 0 or 1, and all rows have the same length.')
  }
  if (grid.flat().filter(v => v === 1).length < 3) throw new Error('The grid needs at least three 1s.')
  return grid
}

// Smallest box holding every 1 in rows [r1, r2) and columns [c1, c2), or null when there is none.
function box(grid, r1, r2, c1, c2) {
  let top = Infinity, bottom = -1, left = Infinity, right = -1
  for (let r = r1; r < r2; r++) for (let c = c1; c < c2; c++) {
    if (grid[r][c] === 1) { top = Math.min(top, r); bottom = Math.max(bottom, r); left = Math.min(left, c); right = Math.max(right, c) }
  }
  if (bottom < 0) return null
  return { r1: top, r2: bottom + 1, c1: left, c2: right + 1, area: (bottom - top + 1) * (right - left + 1) }
}

export function buildTrace(grid) {
  const R = grid.length, C = grid[0].length
  let best = Infinity
  let bestBoxes = null
  const frames = [{ phase: 'start', name: null, boxes: [], total: null, best: null, activeLine: L('set best to infinity'), message: 'Try every way to split the grid with straight cuts into three parts.' }]
  const consider = (name, parts) => {
    if (parts.some(p => p === null)) return
    const total = parts.reduce((s, p) => s + p.area, 0)
    if (total < best) { best = total; bestBoxes = parts }
    frames.push({ phase: 'split', name, boxes: parts, total, best, activeLine: L('if every part has a 1'), message: `${name}: boxes of ${parts.map(p => p.area).join(' + ')} = ${total}.` })
  }
  for (let a = 1; a < R; a++) {
    for (let b = a + 1; b < R; b++) consider('three rows', [box(grid, 0, a, 0, C), box(grid, a, b, 0, C), box(grid, b, R, 0, C)])
    for (let c = 1; c < C; c++) {
      consider('top, then bottom split', [box(grid, 0, a, 0, C), box(grid, a, R, 0, c), box(grid, a, R, c, C)])
      consider('bottom, then top split', [box(grid, a, R, 0, C), box(grid, 0, a, 0, c), box(grid, 0, a, c, C)])
    }
  }
  for (let a = 1; a < C; a++) {
    for (let b = a + 1; b < C; b++) consider('three columns', [box(grid, 0, R, 0, a), box(grid, 0, R, a, b), box(grid, 0, R, b, C)])
    for (let r = 1; r < R; r++) {
      consider('left, then right split', [box(grid, 0, R, 0, a), box(grid, 0, r, a, C), box(grid, r, R, a, C)])
      consider('right, then left split', [box(grid, 0, R, a, C), box(grid, 0, r, 0, a), box(grid, r, R, 0, a)])
    }
  }
  frames.push({ phase: 'done', name: null, boxes: bestBoxes ?? [], total: best, best, activeLine: L('return best'), message: `Minimum total area: ${best}.` })
  return { input: grid, result: best, frames }
}

export const code = `minimum total area of three non-overlapping boxes covering every 1
  set best to infinity
  for every straight-cut split of the grid into three parts
    if every part has a 1 then
      take the smallest box around the 1s in each part
      if the sum of their areas is below best then set best to that sum
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_area(grid):
    R, C = len(grid), len(grid[0])

    def box(r1, r2, c1, c2):
        cells = [(r, c) for r in range(r1, r2) for c in range(c1, c2) if grid[r][c] == 1]
        if not cells:
            return None
        rows = [r for r, _ in cells]
        cols = [c for _, c in cells]
        return (max(rows) - min(rows) + 1) * (max(cols) - min(cols) + 1)

    best = float('inf')

    def consider(parts):
        nonlocal best
        if None in parts:
            return
        best = min(best, sum(parts))

    for a in range(1, R):
        for b in range(a + 1, R):
            consider([box(0, a, 0, C), box(a, b, 0, C), box(b, R, 0, C)])
        for c in range(1, C):
            consider([box(0, a, 0, C), box(a, R, 0, c), box(a, R, c, C)])
            consider([box(a, R, 0, C), box(0, a, 0, c), box(0, a, c, C)])
    for a in range(1, C):
        for b in range(a + 1, C):
            consider([box(0, R, 0, a), box(0, R, a, b), box(0, R, b, C)])
        for r in range(1, R):
            consider([box(0, R, 0, a), box(0, r, a, C), box(r, R, a, C)])
            consider([box(0, R, a, C), box(0, r, 0, a), box(r, R, 0, a)])
    return best
`
