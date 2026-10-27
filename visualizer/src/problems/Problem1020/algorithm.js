export function parseInput(text) {
  const input = JSON.parse(text)
  const grid = input?.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8) throw new Error('Use a grid of 1 to 8 rows.')
  const cols = grid[0]?.length ?? 0
  if (cols < 1 || cols > 8) throw new Error('Each row needs 1 to 8 cells.')
  if (grid.some(row => !Array.isArray(row) || row.length !== cols || row.some(v => v !== 0 && v !== 1))) {
    throw new Error('Every row must have the same length and hold only 0 (water) or 1 (land).')
  }
  return { grid }
}

export function buildTrace({ grid }) {
  const rows = grid.length
  const cols = grid[0].length
  const reached = Array.from({ length: rows }, () => Array(cols).fill(false))
  const marks = () => {
    const out = []
    reached.forEach((line, r) => line.forEach((on, c) => { if (on) out.push([r, c]) }))
    return out
  }
  const queue = []
  const frames = [{ phase: 'start', activeLine: L('count enclaves in grid'), cell: null, reached: [], count: 0, message: 'Land on the border can never be enclosed, so every border land cell starts a flood.' }]

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const onBorder = r === 0 || c === 0 || r === rows - 1 || c === cols - 1
      if (onBorder && grid[r][c] === 1 && !reached[r][c]) {
        reached[r][c] = true
        queue.push([r, c])
        frames.push({ phase: 'seed', activeLine: L('for each land cell on the border'), cell: [r, c], reached: marks(), count: 0, message: `Border land at (${r},${c}) can reach the outside, so it is marked.` })
      }
    }
  }

  let head = 0
  while (head < queue.length) {
    const [r, c] = queue[head++]
    frames.push({ phase: 'expand', activeLine: L('take a cell from the queue'), cell: [r, c], reached: marks(), count: 0, message: `Look at the neighbours of (${r},${c}).` })
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] !== 1 || reached[nr][nc]) continue
      reached[nr][nc] = true
      queue.push([nr, nc])
      frames.push({ phase: 'expand', activeLine: L('if the neighbour is land'), cell: [nr, nc], reached: marks(), count: 0, message: `Land at (${nr},${nc}) joins the outside region.` })
    }
  }

  let count = 0
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === 1 && !reached[r][c]) count++
  frames.push({ phase: 'count', activeLine: L('count land cells that are not reachable'), cell: null, reached: marks(), count, message: `${count} land cells are not marked, so they are enclosed.` })
  frames.push({ phase: 'done', activeLine: L('return the count'), cell: null, reached: marks(), count, message: `Number of enclaves: ${count}.` })
  return { input: { grid }, result: count, frames }
}

export const code = `count enclaves in grid
  create a reachable mark for every cell, all unmarked
  for each land cell on the border
    mark it reachable and add it to the queue
  while the queue is not empty
    take a cell from the queue
    for each of its four neighbours inside the grid
      if the neighbour is land and not yet reachable then
        mark it reachable and add it to the queue
  count land cells that are not reachable
  return the count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_enclaves(grid):
    rows = len(grid)
    cols = len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    queue = []
    for r in range(rows):
        for c in range(cols):
            on_border = r in (0, rows - 1) or c in (0, cols - 1)
            if on_border and grid[r][c] == 1 and not seen[r][c]:
                seen[r][c] = True
                queue.append((r, c))
    head = 0
    while head < len(queue):
        r, c = queue[head]
        head += 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr = r + dr
            nc = c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and not seen[nr][nc]:
                seen[nr][nc] = True
                queue.append((nr, nc))
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and not seen[r][c]:
                count += 1
    return count
`
