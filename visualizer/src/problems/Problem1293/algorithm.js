export function parseInput(text) {
  const input = JSON.parse(text)
  const { grid, k } = input ?? {}
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6 || !Array.isArray(grid[0])) throw new Error('grid is a table of 1 to 6 rows.')
  const cols = grid[0].length
  if (cols < 1 || cols > 6) throw new Error('Each row has 1 to 6 cells.')
  if (grid.some(row => !Array.isArray(row) || row.length !== cols || row.some(v => v !== 0 && v !== 1))) throw new Error('Cells are 0 (empty) or 1 (obstacle).')
  if (grid[0][0] !== 0 || grid[grid.length - 1][cols - 1] !== 0) throw new Error('The top left and bottom right cells must be empty.')
  if (!Number.isInteger(k) || k < 0 || k > 6) throw new Error('k is an integer from 0 to 6.')
  return { grid, k }
}

export function buildTrace(input) {
  const { grid, k } = input
  const m = grid.length
  const n = grid[0].length
  const key = (r, c, used) => `${r},${c},${used}`
  const dist = new Map([[key(0, 0, 0), 0]])
  const queue = [{ r: 0, c: 0, used: 0 }]
  const reached = [[0, 0]]
  const frames = [{ phase: 'start', activeLine: L('start a queue with the top left cell'), current: null, frontier: [[0, 0]], visited: [[0, 0]], steps: 0, message: `Start at the top left with 0 of ${k} removals used.` }]
  let answer = -1
  let head = 0
  while (head < queue.length) {
    const here = queue[head++]
    const steps = dist.get(key(here.r, here.c, here.used))
    if (here.r === m - 1 && here.c === n - 1) {
      answer = steps
      frames.push({ phase: 'found', activeLine: L('if this state is the bottom right cell'), current: [here.r, here.c], frontier: queue.slice(head).map(s => [s.r, s.c]), visited: [...reached], steps, message: `Reached the bottom right cell in ${steps} step(s) with ${here.used} removal(s).` })
      break
    }
    frames.push({ phase: 'pop', activeLine: L('take the next state'), current: [here.r, here.c], frontier: queue.slice(head).map(s => [s.r, s.c]), visited: [...reached], steps, message: `At (${here.r}, ${here.c}) after ${steps} step(s), with ${here.used} removal(s) used.` })
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = here.r + dr
      const nc = here.c + dc
      if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue
      const used = here.used + grid[nr][nc]
      const k2 = key(nr, nc, used)
      if (used <= k && !dist.has(k2)) {
        dist.set(k2, steps + 1)
        queue.push({ r: nr, c: nc, used })
        if (!reached.some(([a, b]) => a === nr && b === nc)) reached.push([nr, nc])
      }
    }
  }
  if (answer === -1) frames.push({ phase: 'done', activeLine: L('the queue empties'), current: null, frontier: [], visited: [...reached], steps: null, message: 'No route reaches the bottom right cell within the removal budget: -1.' })
  else frames.push({ phase: 'done', activeLine: L('return the steps'), current: null, frontier: [], visited: [...reached], steps: answer, message: `Shortest route: ${answer} step(s).` })
  return { input, result: answer, frames }
}

export const code = `shortest path from top left to bottom right, removing at most k obstacles
  set steps to zero and start a queue with the top left cell using zero removals
  mark the top left cell with zero removals as reached
  repeat while the queue is not empty
    take the next state from the queue, as (row, column, removals used)
    if this state is the bottom right cell then return the steps
    for each of the four neighbours inside the grid
      set removals to removals used plus the neighbour obstacle value
      if removals is at most k and this neighbour state is not reached then
        mark it reached and add it to the queue with steps plus one
  the queue empties without reaching the target, so the answer is minus one`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_path_with_elimination(grid, k):
    m, n = len(grid), len(grid[0])
    start = (0, 0, 0)
    dist = {start: 0}
    queue = [start]
    head = 0
    while head < len(queue):
        r, c, used = queue[head]
        head += 1
        if r == m - 1 and c == n - 1:
            return dist[(r, c, used)]
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n:
                nu = used + grid[nr][nc]
                state = (nr, nc, nu)
                if nu <= k and state not in dist:
                    dist[state] = dist[(r, c, used)] + 1
                    queue.append(state)
    return -1
`
