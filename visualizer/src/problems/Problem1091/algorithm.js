const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]

export function parseInput(text) {
  const input = JSON.parse(text)
  const grid = input?.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8) throw new Error('grid is a square of 1 to 8 rows.')
  const n = grid.length
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => v !== 0 && v !== 1))) throw new Error('grid must be square with cells 0 (open) or 1 (blocked).')
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const n = grid.length
  const dist = grid.map(row => row.map(() => 0))
  const frames = []
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) {
    frames.push({ phase: 'blocked', activeLine: L('if the start or end cell is blocked'), current: null, frontier: [], visited: [], message: 'The start or end cell is blocked, so there is no path.' })
    frames.push({ phase: 'done', activeLine: L('the queue empties'), current: null, frontier: [], visited: [], message: 'Answer: -1.' })
    return { input, result: -1, frames }
  }
  dist[0][0] = 1
  const queue = [[0, 0]]
  const reached = [[0, 0]]
  let head = 0
  let answer = -1
  frames.push({ phase: 'start', activeLine: L('set distance of the start cell'), current: null, frontier: [[0, 0]], visited: [[0, 0]], message: 'Start at the top left cell with distance 1.' })
  while (head < queue.length) {
    const [r, c] = queue[head++]
    if (r === n - 1 && c === n - 1) {
      answer = dist[r][c]
      frames.push({ phase: 'found', activeLine: L('return its distance'), current: [r, c], frontier: queue.slice(head), visited: [...reached], message: `Reached the bottom right cell at distance ${answer}.` })
      break
    }
    frames.push({ phase: 'pop', activeLine: L('take the first cell from the queue'), current: [r, c], frontier: queue.slice(head), visited: [...reached], message: `Process (${r}, ${c}) at distance ${dist[r][c]}.` })
    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0 && dist[nr][nc] === 0) {
        dist[nr][nc] = dist[r][c] + 1
        queue.push([nr, nc])
        reached.push([nr, nc])
      }
    }
  }
  if (answer === -1) frames.push({ phase: 'done', activeLine: L('the queue empties'), current: null, frontier: [], visited: [...reached], message: 'The queue emptied before the bottom right cell was reached: -1.' })
  return { input, result: answer, frames }
}

export const code = `shortest clear path length from top left to bottom right, moving in eight directions
  if the start or end cell is blocked then stop with no path
  set distance of the start cell to one and put it in a queue
  repeat while the queue is not empty
    take the first cell from the queue and call it here
    if here is the end cell then return its distance
    for each of the eight neighbours of here that is open and not reached
      set its distance to the distance of here plus one and add it to the queue
  the queue empties without reaching the end, so the answer is minus one`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_path_binary_matrix(grid):
    n = len(grid)
    if grid[0][0] == 1 or grid[n - 1][n - 1] == 1:
        return -1
    dist = [[0] * n for _ in range(n)]
    dist[0][0] = 1
    queue = [(0, 0)]
    head = 0
    while head < len(queue):
        r, c = queue[head]
        head += 1
        if r == n - 1 and c == n - 1:
            return dist[r][c]
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0 and dist[nr][nc] == 0:
                    dist[nr][nc] = dist[r][c] + 1
                    queue.append((nr, nc))
    return -1
`
