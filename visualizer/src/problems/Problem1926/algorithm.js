// LeetCode 1926: breadth-first search from the entrance over empty cells. The first newly reached border cell is the nearest exit, and its distance is the answer.
const SOURCE = [
  "function nearestExit(maze, entrance) {",
  "  const m = maze.length, n = maze[0].length",
  "  const dist = Array.from({ length: m }, () => new Array(n).fill(-1))",
  "  const [er, ec] = entrance",
  "  dist[er][ec] = 0",
  "  const queue = [[er, ec]]",
  "  let head = 0",
  "  while (head < queue.length) {",
  "    const [r, c] = queue[head++]",
  "    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {",
  "      if (nr < 0 || nr >= m || nc < 0 || nc >= n || maze[nr][nc] !== '.' || dist[nr][nc] !== -1) continue",
  "      dist[nr][nc] = dist[r][c] + 1",
  "      const border = nr === 0 || nr === m - 1 || nc === 0 || nc === n - 1",
  "      if (border) return dist[nr][nc]",
  "      queue.push([nr, nc])",
  "    }",
  "  }",
  "  return -1",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def nearest_exit(maze, entrance):
    m, n = len(maze), len(maze[0])
    dist = [[-1] * n for _ in range(m)]
    queue = deque([tuple(entrance)])
    dist[entrance[0]][entrance[1]] = 0
    while queue:
        r, c = queue.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < m and 0 <= nc < n and maze[nr][nc] == "." and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                if nr in (0, m - 1) or nc in (0, n - 1):
                    return dist[nr][nc]
                queue.append((nr, nc))
    return -1
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'expand', label: 'Expand', description: 'Explore empty neighbours one step further from the entrance.' },
  { id: 'done', label: 'Result', description: 'Steps to the nearest exit, or -1.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"maze":["+.+","...","+.+"],"entrance":[1,1]}.') }
  const { maze, entrance } = input || {}
  if (!Array.isArray(maze) || maze.length < 1 || maze.length > 8 || !maze.every(row => typeof row === 'string' && /^[.+]+$/.test(row) && row.length === maze[0].length)) throw new Error('maze is up to 8 rows of . and + of equal length.')
  if (maze[0].length > 8) throw new Error('maze is at most 8 columns wide.')
  if (!Array.isArray(entrance) || entrance.length !== 2 || !Number.isInteger(entrance[0]) || !Number.isInteger(entrance[1]) || entrance[0] < 0 || entrance[0] >= maze.length || entrance[1] < 0 || entrance[1] >= maze[0].length) throw new Error('entrance is a cell inside the maze.')
  if (maze[entrance[0]][entrance[1]] !== '.') throw new Error('The entrance must be an empty cell.')
  return { maze, entrance }
}

export function buildTrace({ maze, entrance }) {
  const m = maze.length, n = maze[0].length
  const dist = Array.from({ length: m }, () => new Array(n).fill(-1))
  const [er, ec] = entrance
  dist[er][ec] = 0
  const queue = [[er, ec]]
  const frames = []
  let head = 0
  let answer = -1
  const reached = []
  outer: while (head < queue.length) {
    const [r, c] = queue[head++]
    frames.push({ phase: 'expand', activeLine: L('const [r, c] = queue[head++]'), pythonLine: P('r, c = queue.popleft'), message: `Process (${r}, ${c}) at distance ${dist[r][c]}.`, current: [r, c], neighbour: null, frontier: queue.slice(head), dist: dist.map(row => [...row]), reached: [...reached] })
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nr >= m || nc < 0 || nc >= n || maze[nr][nc] !== '.' || dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      reached.push([nr, nc])
      const border = nr === 0 || nr === m - 1 || nc === 0 || nc === n - 1
      frames.push({ phase: 'expand', activeLine: L(border ? 'if (border) return' : 'queue.push([nr, nc])'), pythonLine: P('dist[nr][nc] = dist'), message: border ? `(${nr}, ${nc}) is on the border at distance ${dist[nr][nc]}: the nearest exit.` : `(${nr}, ${nc}) is new at distance ${dist[nr][nc]}.`, current: [r, c], neighbour: [nr, nc], frontier: queue.slice(head), dist: dist.map(row => [...row]), reached: [...reached] })
      if (border) { answer = dist[nr][nc]; break outer }
      queue.push([nr, nc])
    }
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: P(answer >= 0 ? 'return dist' : 'return -1'), message: answer >= 0 ? `Nearest exit is ${answer} step(s) away.` : 'No exit is reachable.', current: null, neighbour: null, frontier: [], dist: dist.map(row => [...row]), reached: [...reached], result: answer })
  return { input: { maze, entrance }, result: answer, frames }
}
