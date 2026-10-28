export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid array.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 7 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 7) throw new Error('grid must be at most 7 by 7.')
  const n = grid[0].length
  if (grid.length * n < 2) throw new Error('grid needs at least two cells, so the start and end differ.')
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => v !== 0 && v !== 1))) throw new Error('grid must be rectangular, with only 0 and 1 values.')
  return { grid }
}

const copy = grid => grid.map(row => [...row])
const endOf = grid => [grid.length - 1, grid[0].length - 1]

// Breadth-first search over ones. Returns one shortest route from the top-left to the bottom-right, or null.
function shortestRoute(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const [endR, endC] = endOf(grid)
  if (grid[0][0] === 0 || grid[endR][endC] === 0) return null
  const parent = new Map([['0,0', null]])
  const queue = [[0, 0]]
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    if (r === endR && c === endC) {
      const route = []
      let at = [r, c]
      while (at) {
        route.push(at)
        at = parent.get(at.join(','))
      }
      return route.reverse()
    }
    for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1 && !parent.has(`${nr},${nc}`)) {
        parent.set(`${nr},${nc}`, [r, c])
        queue.push([nr, nc])
      }
    }
  }
  return null
}

export function buildTrace(input) {
  const { grid } = input
  const frames = [{ phase: 'start', activeLine: L('find one shortest route'), route: [], candidate: null, message: 'Look for a route of ones from the top-left to the bottom-right.' }]
  const route = shortestRoute(grid)
  if (!route) {
    frames.push({ phase: 'done', activeLine: L('return true'), route: [], candidate: null, message: 'No route exists already, so no flip is needed.' })
    return { input, result: true, frames }
  }
  frames.push({ phase: 'route', activeLine: L('find one shortest route'), route, candidate: null, message: `Found a route of ${route.length} cells. Any single cut must lie on it.` })
  for (const [r, c] of route.slice(1, -1)) {
    const board = copy(grid)
    board[r][c] = 0
    frames.push({ phase: 'candidate', activeLine: L('set the cell to 0'), route, candidate: [r, c], message: `Flip (${r}, ${c}) to 0 in a copy and look for another route.` })
    if (!shortestRoute(board)) {
      frames.push({ phase: 'done', activeLine: L('no longer reachable'), route, candidate: [r, c], message: `Flipping (${r}, ${c}) cuts every route. The answer is true.` })
      return { input, result: true, frames }
    }
    frames.push({ phase: 'candidate', activeLine: L('no longer reachable'), route, candidate: [r, c], message: `A route still survives without (${r}, ${c}).` })
  }
  frames.push({ phase: 'done', activeLine: L('return false'), route, candidate: null, message: 'No single flip cuts every route. The answer is false.' })
  return { input, result: false, frames }
}

export const code = `can disconnect (grid):
  find one shortest route of ones from the start to the end
  if there is no route then
    return true
  for each cell on the route other than the start and end
    copy the grid and set the cell to 0 in the copy
    if the end is no longer reachable from the start then
      return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def can_disconnect(grid):
    rows, cols = len(grid), len(grid[0])
    end = (rows - 1, cols - 1)

    def shortest_route(board):
        if board[0][0] == 0 or board[rows - 1][cols - 1] == 0:
            return None
        parent = {(0, 0): None}
        queue = deque([(0, 0)])
        while queue:
            cell = queue.popleft()
            if cell == end:
                route = []
                while cell is not None:
                    route.append(cell)
                    cell = parent[cell]
                return route[::-1]
            r, c = cell
            for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] == 1 and (nr, nc) not in parent:
                    parent[(nr, nc)] = cell
                    queue.append((nr, nc))
        return None

    route = shortest_route(grid)
    if route is None:
        return True
    for r, c in route[1:-1]:
        board = [row[:] for row in grid]
        board[r][c] = 0
        if shortest_route(board) is None:
            return True
    return False
`
