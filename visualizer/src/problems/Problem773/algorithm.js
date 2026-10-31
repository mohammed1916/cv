export const NEIGHBORS = [[1, 3], [0, 2, 4], [1, 5], [0, 4], [1, 3, 5], [2, 4]]
export const TARGET = '123450'
export function parseInput(text) {
  const board = JSON.parse(text)
  const ok = Array.isArray(board) && board.length === 2 && board.every(r => Array.isArray(r) && r.length === 3 && r.every(Number.isInteger)) && [...board.flat()].sort((a, b) => a - b).every((v, i) => v === i)
  if (!ok) throw new Error('Enter a 2x3 JSON board that uses each of 0..5 exactly once, e.g. [[1,2,3],[4,0,5]].')
  return board
}
export function buildTrace(board) {
  const start = board.flat().join('')
  const frames = [{ phase: 'start', activeLine: L('queue = new queue'), pythonLine: 7, state: start, dist: 0, queueSize: 1, seen: 1, added: [], message: `Encode the board as "${start}". BFS explores boards by number of moves, so the first time we pop "${TARGET}" is the shortest.` }]
  const seen = new Set([start])
  const queue = [[start, 0]]
  let head = 0
  let result = -1
  while (head < queue.length) {
    const [s, d] = queue[head++]
    if (s === TARGET) {
      result = d
      frames.push({ phase: 'solved', activeLine: L('if s equals target'), pythonLine: 12, state: s, dist: d, queueSize: queue.length - head, seen: seen.size, added: [], message: `Dequeued the solved board after ${d} moves.` })
      break
    }
    const z = s.indexOf('0')
    const added = []
    for (const j of NEIGHBORS[z]) {
      const t = [...s]
      ;[t[z], t[j]] = [t[j], t[z]]
      const key = t.join('')
      if (!seen.has(key)) { seen.add(key); queue.push([key, d + 1]); added.push(key) }
    }
    frames.push({ phase: 'expand', activeLine: L('for each neighbour j'), pythonLine: 14, state: s, dist: d, queueSize: queue.length - head, seen: seen.size, added, message: `Dequeue "${s}" (${d} moves). Slide the blank from cell ${z} into its neighbours ${NEIGHBORS[z].join(', ')}: ${added.length ? `${added.length} new board${added.length > 1 ? 's' : ''} (${added.join(', ')}) queued at ${d + 1} moves` : 'all already seen'}.` })
  }
  if (result === -1) frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: 21, state: start, dist: -1, queueSize: 0, seen: seen.size, added: [], message: `Queue exhausted after visiting ${seen.size} boards without reaching "${TARGET}". Unsolvable: return -1.` })
  else frames.push({ phase: 'done', activeLine: L('then return d'), pythonLine: 12, state: TARGET, dist: result, queueSize: queue.length - head, seen: seen.size, added: [], message: `Minimum number of moves: ${result}.` })
  return { input: board, result, frames }
}
export const code = `function slidingPuzzle(board):
  start = the 6 cells read row by row as a string
  target = "123450"
  nbr = the neighbouring cell positions of each cell
  queue = new queue holding (start, 0)
  seen = {start}
  while the queue is not empty:
    take the oldest (s, d) from the front of queue
    if s equals target then return d
    z = position of the blank "0" in s
    for each neighbour j of z in nbr:
      t = s with the blank and the tile at j swapped
      if t is not seen then
        mark t as seen
        append (t, d + 1) to the back of queue
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def sliding_puzzle(board):
    start = ''.join(str(x) for row in board for x in row)
    target = '123450'
    nbr = [[1, 3], [0, 2, 4], [1, 5], [0, 4], [1, 3, 5], [2, 4]]
    queue = deque([(start, 0)])
    seen = {start}
    while queue:
        s, d = queue.popleft()
        if s == target:
            return d
        z = s.index('0')
        for j in nbr[z]:
            t = list(s)
            t[z], t[j] = t[j], t[z]
            t = ''.join(t)
            if t not in seen:
                seen.add(t)
                queue.append((t, d + 1))
    return -1`
