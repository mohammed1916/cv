export function parseInput(text) {
  const board = JSON.parse(text)
  const n = Array.isArray(board) ? board.length : 0
  if (n < 2 || n > 20 || board.some(r => !Array.isArray(r) || r.length !== n)) throw new Error('Enter a square JSON grid with 2 to 20 rows and columns (capped at 20 for visualization).')
  if (board.some(r => r.some(v => !Number.isInteger(v) || (v !== -1 && (v < 1 || v > n * n))))) throw new Error('Every cell must be -1 or a square label from 1 to n*n.')
  if (board[n - 1][0] !== -1) throw new Error('The starting square (bottom-left) must be -1.')
  return board.map(r => [...r])
}
export function flatten(board) {
  const n = board.length
  const cells = new Array(n * n + 1).fill(0)
  let label = 1
  for (let r = n - 1; r >= 0; r--) {
    const leftToRight = (n - 1 - r) % 2 === 0
    for (let k = 0; k < n; k++) cells[label++] = board[r][leftToRight ? k : n - 1 - k]
  }
  return cells
}
export function buildTrace(board) {
  const n = board.length, total = n * n
  const cells = flatten(board)
  const dist = new Array(total + 1).fill(-1)
  dist[1] = 0
  const queue = [1]
  let head = 0
  const snap = () => ({ dist: dist.slice(1), queue: queue.slice(head) })
  const frames = [{ phase: 'start', activeLine: 11, cur: 1, discovered: [], ...snap(), message: `Flatten the ${n}x${n} board into squares 1..${total} (rows alternate direction). Square 1 is at distance 0; BFS explores one dice roll per level.` }]
  while (head < queue.length) {
    const cur = queue[head++]
    frames.push({ phase: 'pop', activeLine: 13, cur, discovered: [], ...snap(), message: `Take square ${cur} (distance ${dist[cur]}) from the queue.` })
    const discovered = []
    const notes = []
    for (let nxt = cur + 1; nxt <= Math.min(cur + 6, total); nxt++) {
      const dest = cells[nxt] !== -1 ? cells[nxt] : nxt
      const jump = cells[nxt] !== -1 ? ` (${cells[nxt] > nxt ? 'ladder' : 'snake'} to ${dest})` : ''
      if (dist[dest] === -1) {
        dist[dest] = dist[cur] + 1
        queue.push(dest)
        discovered.push(dest)
        notes.push(`roll to ${nxt}${jump} reaches new square ${dest}`)
      } else notes.push(`roll to ${nxt}${jump} lands on ${dest}, already seen`)
    }
    frames.push({ phase: 'expand', activeLine: 18, cur, discovered, ...snap(), message: `From ${cur}: ${notes.join('; ')}.` })
  }
  const result = dist[total]
  frames.push({ phase: 'done', activeLine: 19, cur: total, discovered: [], ...snap(), message: result === -1 ? 'The last square was never reached: return -1.' : `Square ${total} is reached in ${result} moves.` })
  return { input: board, cells, result, frames }
}
export const code = `def snakesAndLadders(board):
    n = len(board)
    cells = [0] * (n * n + 1)
    label = 1
    for r in range(n - 1, -1, -1):
        cols = range(n) if (n - 1 - r) % 2 == 0 else range(n - 1, -1, -1)
        for c in cols:
            cells[label] = board[r][c]
            label += 1
    dist = [-1] * (n * n + 1)
    dist[1] = 0
    queue = deque([1])
    while queue:
        cur = queue.popleft()
        for nxt in range(cur + 1, min(cur + 6, n * n) + 1):
            dest = cells[nxt] if cells[nxt] != -1 else nxt
            if dist[dest] == -1:
                dist[dest] = dist[cur] + 1
                queue.append(dest)
    return dist[n * n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
