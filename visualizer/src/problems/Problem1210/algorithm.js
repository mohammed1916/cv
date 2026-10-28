export function parseInput(text) {
  const input = JSON.parse(text)
  const grid = input?.grid
  if (!Array.isArray(grid) || grid.length < 2 || grid.length > 6) throw new Error('grid is a square of 2 to 6 rows.')
  const n = grid.length
  if (grid.some(row => !Array.isArray(row) || row.length !== n || row.some(v => v !== 0 && v !== 1))) throw new Error('grid must be square with cells 0 (empty) or 1 (blocked).')
  if (grid[0][0] !== 0 || grid[0][1] !== 0 || grid[n - 1][n - 2] !== 0 || grid[n - 1][n - 1] !== 0) throw new Error('The start snake and the target cells must be empty.')
  return { grid }
}

// State: tail cell (r, c) and orientation 0 = horizontal (head at c + 1), 1 = vertical (head at r + 1).
export function buildTrace(input) {
  const { grid } = input
  const n = grid.length
  const free = (r, c) => r >= 0 && c >= 0 && r < n && c < n && grid[r][c] === 0
  const cells = (r, c, o) => (o === 0 ? [[r, c], [r, c + 1]] : [[r, c], [r + 1, c]])
  const key = (r, c, o) => `${r},${c},${o}`
  const dist = new Map([[key(0, 0, 0), 0]])
  const queue = [[0, 0, 0]]
  const reached = [[0, 0]]
  const frames = [{ phase: 'start', activeLine: L('set the start to the horizontal snake'), tail: [0, 0], head: [0, 1], visited: [[0, 0]], moves: 0, message: 'Start with the snake lying flat across the top left.' }]
  let answer = -1
  let head = 0
  while (head < queue.length) {
    const [r, c, o] = queue[head++]
    const moves = dist.get(key(r, c, o))
    const [tail, front] = cells(r, c, o)
    if (r === n - 1 && c === n - 2 && o === 0) {
      answer = moves
      frames.push({ phase: 'found', activeLine: L('if here is the target position'), tail, head: front, visited: [...reached], moves, message: `The snake lies flat in the bottom right after ${moves} move(s).` })
      break
    }
    frames.push({ phase: 'pop', activeLine: L('take the next snake position'), tail, head: front, visited: [...reached], moves, message: `Snake at tail (${r}, ${c}) ${o === 0 ? 'flat' : 'upright'} after ${moves} move(s).` })
    const next = []
    if (o === 0) {
      if (free(r, c + 2)) next.push([r, c + 1, 0])
      if (free(r + 1, c) && free(r + 1, c + 1)) {
        next.push([r + 1, c, 0])
        next.push([r, c, 1])
      }
    } else {
      if (free(r + 2, c)) next.push([r + 1, c, 1])
      if (free(r, c + 1) && free(r + 1, c + 1)) {
        next.push([r, c + 1, 1])
        next.push([r, c, 0])
      }
    }
    for (const [nr, nc, no] of next) {
      const k2 = key(nr, nc, no)
      if (!dist.has(k2)) {
        dist.set(k2, moves + 1)
        queue.push([nr, nc, no])
        if (!reached.some(([a, b]) => a === nr && b === nc)) reached.push([nr, nc])
      }
    }
  }
  if (answer === -1) frames.push({ phase: 'done', activeLine: L('the queue empties'), tail: null, head: null, visited: [...reached], moves: null, message: 'The target cannot be reached: -1.' })
  else frames.push({ phase: 'done', activeLine: L('return its moves'), tail: null, head: null, visited: [...reached], moves: answer, message: `Minimum moves: ${answer}.` })
  return { input, result: answer, frames }
}

export const code = `minimum moves for a two-cell snake to reach the bottom right corner
  set the start to the horizontal snake with its tail at the top left
  set its moves to zero and put it in a queue
  repeat while the queue is not empty
    take the next snake position and call it here
    if here is the target position then return its moves
    list the legal moves: slide right, slide down, or rotate when the square beside it is clear
    for each move that is not reached yet, record moves plus one and add it to the queue
  the queue empties without reaching the target, so the answer is minus one`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_moves(grid):
    n = len(grid)
    def free(r, c):
        return 0 <= r < n and 0 <= c < n and grid[r][c] == 0
    start = (0, 0, 0)
    target = (n - 1, n - 2, 0)
    dist = {start: 0}
    queue = [start]
    head = 0
    while head < len(queue):
        state = queue[head]
        head += 1
        if state == target:
            return dist[state]
        r, c, o = state
        moves = []
        if o == 0:
            if free(r, c + 2):
                moves.append((r, c + 1, 0))
            if free(r + 1, c) and free(r + 1, c + 1):
                moves.append((r + 1, c, 0))
                moves.append((r, c, 1))
        else:
            if free(r + 2, c):
                moves.append((r + 1, c, 1))
            if free(r, c + 1) and free(r + 1, c + 1):
                moves.append((r, c + 1, 1))
                moves.append((r, c, 0))
        for s in moves:
            if s not in dist:
                dist[s] = dist[state] + 1
                queue.append(s)
    return -1
`
