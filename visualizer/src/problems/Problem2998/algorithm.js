export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with x and y.')
  const { x, y } = data
  if (!Number.isInteger(x) || x < 1 || x > 200) throw new Error('x is an integer from 1 to 200.')
  if (!Number.isInteger(y) || y < 1 || y > 200) throw new Error('y is an integer from 1 to 200.')
  return { x, y }
}

export function buildTrace(input) {
  const { x, y } = input
  const limit = 10 * Math.max(x, y) + 100
  const dist = new Map([[x, 0]])
  const queue = [x]
  const frames = [{ phase: 'start', activeLine: L('set dist of x to 0'), value: x, distance: 0, queued: 1, message: `Search outward from ${x} until ${y} is reached.` }]
  let result = null
  for (let head = 0; head < queue.length; head++) {
    const v = queue[head]
    const d = dist.get(v)
    if (v === y) {
      frames.push({ phase: 'found', activeLine: L('if v equals y'), value: v, distance: d, queued: queue.length - head - 1, message: `Reached ${y} after ${d} operations.` })
      result = d
      break
    }
    const moves = [v - 1, v + 1]
    if (v % 11 === 0) moves.push(v / 11)
    if (v % 5 === 0) moves.push(v / 5)
    frames.push({ phase: 'visit', activeLine: L('for each value w'), value: v, distance: d, queued: queue.length - head - 1, moves, message: `From ${v} (after ${d} operations), the moves reach ${moves.join(', ')}.` })
    for (const w of moves) {
      if (w < 1 || w > limit || dist.has(w)) continue
      dist.set(w, d + 1)
      queue.push(w)
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the distance'), value: null, distance: result, queued: 0, message: `Fewest operations: ${result}.` })
  return { input, result, frames }
}

export const code = `fewest operations to turn x into y
  set limit to 10 times the larger of x and y, plus 100
  set dist of x to 0 and put x in a queue
  while the queue is not empty
    take the next value v from the front of the queue
    if v equals y then return the distance of v
    for each value w reachable from v in one operation
      if w is between 1 and limit and w is not yet seen then
        set dist of w to dist of v plus 1 and add w to the queue
  return the distance of y

one operation from v: subtract 1, add 1, divide by 11 when v is a multiple of 11, divide by 5 when v is a multiple of 5`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque


def min_operations(x, y):
    limit = 10 * max(x, y) + 100
    dist = {x: 0}
    queue = deque([x])
    while queue:
        v = queue.popleft()
        if v == y:
            return dist[v]
        moves = [v - 1, v + 1]
        if v % 11 == 0:
            moves.append(v // 11)
        if v % 5 == 0:
            moves.append(v // 5)
        for w in moves:
            if 1 <= w <= limit and w not in dist:
                dist[w] = dist[v] + 1
                queue.append(w)
    return None
`
