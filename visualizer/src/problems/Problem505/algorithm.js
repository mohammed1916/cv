// The Maze II: a ball rolls in one direction until it hits a wall. Find the shortest distance (empty cells travelled)
// to reach the destination, where the ball must stop there. Dijkstra over stopping cells, with a simple selection step.
export const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.maze)) throw new Error('Use an object with maze, start and destination.')
  const { maze, start, destination } = input
  if (maze.length < 1 || maze.length > 5 || maze.some(row => !Array.isArray(row) || row.length !== maze[0].length || row.length < 1 || row.length > 5 || row.some(v => v !== 0 && v !== 1))) throw new Error('maze is a rectangle of 0 (empty) and 1 (wall), at most 5 by 5.')
  const inside = cell => Array.isArray(cell) && cell.length === 2 && Number.isInteger(cell[0]) && Number.isInteger(cell[1]) && cell[0] >= 0 && cell[0] < maze.length && cell[1] >= 0 && cell[1] < maze[0].length && maze[cell[0]][cell[1]] === 0
  if (!inside(start) || !inside(destination)) throw new Error('start and destination are empty cells inside the maze.')
  return { maze, start, destination }
}

export const CODE_LINES = [
  'def shortest_distance(maze, start, destination):',
  '    rows, cols = len(maze), len(maze[0])',
  '    dist = [[inf] * cols for _ in range(rows)]',
  '    dist[start[0]][start[1]] = 0',
  '    done = set()',
  '    while True:',
  '        current = unfinished cell with the smallest dist',
  '        if current is None: return -1',
  '        r, c = current',
  '        done.add((r, c))',
  '        if (r, c) == destination: return dist[r][c]',
  '        for dr, dc in directions:',
  '            steps, nr, nc = roll(maze, r, c, dr, dc)',
  '            if dist[r][c] + steps < dist[nr][nc]:',
  '                dist[nr][nc] = dist[r][c] + steps',
  '    return -1',
]
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = CODE_LINES.join('\n') + '\n'

// Rolls from (r, c) until the next cell is a wall or the edge; returns the empty cells travelled and the stop.
export function roll(maze, r, c, dr, dc) {
  let steps = 0
  let nr = r
  let nc = c
  while (nr + dr >= 0 && nr + dr < maze.length && nc + dc >= 0 && nc + dc < maze[0].length && maze[nr + dr][nc + dc] === 0) {
    nr += dr
    nc += dc
    steps++
  }
  return { steps, nr, nc }
}

export function buildTrace({ maze, start, destination }) {
  const rows = maze.length
  const cols = maze[0].length
  const INF = Infinity
  const dist = Array.from({ length: rows }, () => Array(cols).fill(INF))
  dist[start[0]][start[1]] = 0
  const done = new Set()
  const frames = []
  const snap = (extra) => ({ dist: dist.map(row => [...row]), done: [...done].map(key => key.split(',').map(Number)), start, destination, ...extra })
  frames.push(snap({ phase: 'start', activeLine: 4, current: null, next: null, message: `Start at [${start}] with distance 0.` }))
  for (;;) {
    let current = null
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (!done.has(`${r},${c}`) && dist[r][c] < INF && (!current || dist[r][c] < dist[current[0]][current[1]])) current = [r, c]
    }
    if (!current) {
      frames.push(snap({ phase: 'lose', activeLine: 7, current: null, next: null, result: -1, message: 'No unfinished cell can be reached. The answer is -1.' }))
      return { input: { maze, start, destination }, result: -1, frames }
    }
    const [r, c] = current
    done.add(`${r},${c}`)
    frames.push(snap({ phase: 'pick', activeLine: 9, current, next: null, message: `Finish the closest cell [${r}, ${c}] at distance ${dist[r][c]}.` }))
    if (r === destination[0] && c === destination[1]) {
      frames.push(snap({ phase: 'done', activeLine: 11, current, next: null, result: dist[r][c], message: `The ball stops at the destination after ${dist[r][c]} steps.` }))
      return { input: { maze, start, destination }, result: dist[r][c], frames }
    }
    for (const [dr, dc] of DIRECTIONS) {
      const { steps, nr, nc } = roll(maze, r, c, dr, dc)
      frames.push(snap({ phase: 'roll', activeLine: 13, current, next: [nr, nc], steps, message: `Roll ${dr === -1 ? 'up' : dr === 1 ? 'down' : dc === -1 ? 'left' : 'right'}: ${steps} steps to stop at [${nr}, ${nc}].` }))
      if (dist[r][c] + steps < dist[nr][nc]) {
        dist[nr][nc] = dist[r][c] + steps
        frames.push(snap({ phase: 'relax', activeLine: 15, current, next: [nr, nc], steps, message: `Shorter route to [${nr}, ${nc}]: distance ${dist[nr][nc]}.` }))
      }
    }
  }
}
