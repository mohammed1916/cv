// Depth-first search with backtracking. From the start, try each neighbour that is open and unvisited, go as far as
// the walk allows, and undo the move when the walk cannot finish. A walk counts only when it ends on the target
// after every empty square has been visited.
export const code = String.raw`function uniquePathsIII(grid) {
  const rows = grid.length, cols = grid[0].length;
  let start = null, empties = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) start = [r, c];
      if (grid[r][c] === 0) empties++;
    }
  }
  const visited = grid.map(row => row.map(() => false));
  let count = 0;
  const walk = (r, c, remaining) => { // remaining: empty squares not yet visited
    if (grid[r][c] === 2) {
      if (remaining === 0) count++; // reached the target with every empty square used
      return;
    }
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || visited[nr][nc] || grid[nr][nc] === -1) continue;
      visited[nr][nc] = true;
      walk(nr, nc, grid[nr][nc] === 0 ? remaining - 1 : remaining);
      visited[nr][nc] = false; // backtrack: the square is free again for other walks
    }
  };
  visited[start[0]][start[1]] = true;
  walk(start[0], start[1], empties);
  return count;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def unique_paths_iii(grid):
    rows, cols = len(grid), len(grid[0])
    start = None
    empties = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                start = (r, c)
            if grid[r][c] == 0:
                empties += 1
    visited = [[False] * cols for _ in range(rows)]
    count = 0

    def walk(r, c, remaining):  # remaining: empty squares not yet visited
        nonlocal count
        if grid[r][c] == 2:
            if remaining == 0:
                count += 1  # reached the target with every empty square used
            return
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if nr < 0 or nc < 0 or nr >= rows or nc >= cols or visited[nr][nc] or grid[nr][nc] == -1:
                continue
            visited[nr][nc] = True
            walk(nr, nc, remaining - 1 if grid[nr][nc] == 0 else remaining)
            visited[nr][nc] = False  # backtrack: the square is free again for other walks

    visited[start[0]][start[1]] = True
    walk(start[0], start[1], empties)
    return count`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'walk', label: 'Walk', description: 'Extend the path one open square at a time.' },
  { id: 'backtrack', label: 'Backtrack', description: 'Undo a step when the walk cannot finish from there.' },
  { id: 'done', label: 'Count', description: 'The number of walks that cover every empty square.' },
]

export const MAX_STEPS = 4000

export function parseInput(text) {
  const input = JSON.parse(text)
  const grid = input && input.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 5) throw new Error('Use grid: a list of 1 to 5 rows.')
  const cols = grid[0].length
  if (!grid.every(row => Array.isArray(row) && row.length === cols) || cols < 1 || cols > 5) {
    throw new Error('Every row must have the same length, from 1 to 5 cells.')
  }
  if (grid.length * cols > 12) throw new Error('Use at most 12 squares so the walk can be shown step by step.')
  let starts = 0, ends = 0
  for (const row of grid) for (const v of row) {
    if (![-1, 0, 1, 2].includes(v)) throw new Error('Cells must be -1 (obstacle), 0 (empty), 1 (start) or 2 (end).')
    if (v === 1) starts++
    if (v === 2) ends++
  }
  if (starts !== 1 || ends !== 1) throw new Error('The grid needs exactly one start (1) and one end (2).')
  return { grid }
}

export function buildTrace({ grid }) {
  const rows = grid.length, cols = grid[0].length
  let start = null, empties = 0
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c] === 1) start = [r, c]
    if (grid[r][c] === 0) empties++
  }
  const visited = grid.map(row => row.map(() => false))
  const frames = []
  const path = [start]
  let count = 0
  const push = (phase, js, py, message, extra = {}) => {
    if (frames.length >= MAX_STEPS) throw new Error('This grid needs too many steps to show. Try a smaller grid.')
    frames.push({ phase, activeLine: L(js), pythonLine: PY(py), message, path: path.map(p => [...p]), count, ...extra })
  }
  const walk = (r, c, remaining) => {
    if (grid[r][c] === 2) {
      if (remaining === 0) {
        count++
        push('done', 'count++', 'count += 1', `Reached the target with every empty square used. This is walk number ${count}.`, { at: [r, c], remaining, found: true })
      } else {
        push('backtrack', 'if (grid[r][c] === 2)', 'if grid[r][c] == 2', `The target is reached too early, with ${remaining} empty square(s) unused. This walk is abandoned.`, { at: [r, c], remaining })
      }
      return
    }
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || visited[nr][nc] || grid[nr][nc] === -1) continue
      visited[nr][nc] = true
      path.push([nr, nc])
      const next = grid[nr][nc] === 0 ? remaining - 1 : remaining
      push('walk', 'visited[nr][nc] = true', 'visited[nr][nc] = True', `Step to (${nr},${nc}). ${next} empty square(s) are still unvisited.`, { at: [nr, nc], remaining: next })
      walk(nr, nc, next)
      path.pop()
      visited[nr][nc] = false
      push('backtrack', 'visited[nr][nc] = false', 'visited[nr][nc] = False', `Back up from (${nr},${nc}) and free the square for other walks.`, { at: [r, c], remaining, undone: [nr, nc] })
    }
  }
  visited[start[0]][start[1]] = true
  push('walk', 'visited[start[0]][start[1]] = true', 'visited[start[0]][start[1]] = True', `Start at (${start[0]},${start[1]}) with ${empties} empty square(s) to visit.`, { at: start, remaining: empties })
  walk(start[0], start[1], empties)
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: PY('return count'), message: `${count} walk(s) cover every empty square and end on the target.`, path: [], count, at: null, remaining: 0 })
  return { input: { grid }, result: count, frames }
}
