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
  const seenSnapshot = () => [...dist.entries()].map(([value, distance]) => ({ value, distance }))
  const frames = [{ pythonLine: 6, phase: 'start', activeLine: L('const dist = new Map'), value: x, distance: 0, queued: 1, seen: seenSnapshot(), message: `Search outward from ${x} until ${y} is reached.` }]
  let result = null
  for (let head = 0; head < queue.length; head++) {
    const v = queue[head]
    const d = dist.get(v)
    if (v === y) {
      frames.push({ pythonLine: 11, phase: 'found', activeLine: L('if (v === y)'), value: v, distance: d, queued: queue.length - head - 1, seen: seenSnapshot(), message: `Reached ${y} after ${d} operations.` })
      result = d
      break
    }
    const moves = [v - 1, v + 1]
    if (v % 11 === 0) moves.push(v / 11)
    if (v % 5 === 0) moves.push(v / 5)
    frames.push({ pythonLine: 17, phase: 'visit', activeLine: L('for (const w of moves)'), value: v, distance: d, queued: queue.length - head - 1, moves, seen: seenSnapshot(), message: `From ${v} (after ${d} operations), the moves reach ${moves.join(', ')}.` })
    for (const w of moves) {
      if (w < 1 || w > limit || dist.has(w)) continue
      dist.set(w, d + 1)
      queue.push(w)
    }
  }
  frames.push({ pythonLine: 21, phase: 'done', activeLine: L('return dist.get(y)'), value: null, distance: result, queued: 0, seen: seenSnapshot(), message: `Fewest operations: ${result}.` })
  return { input, result, frames }
}

export const code = `function minOperations(x, y) {
  const limit = 10 * Math.max(x, y) + 100
  const dist = new Map([[x, 0]])
  const queue = [x]
  for (let head = 0; head < queue.length; head++) {
    const v = queue[head]
    if (v === y) return dist.get(v)
    const moves = [v - 1, v + 1]
    if (v % 11 === 0) moves.push(v / 11)
    if (v % 5 === 0) moves.push(v / 5)
    for (const w of moves) {
      if (w < 1 || w > limit || dist.has(w)) continue
      dist.set(w, dist.get(v) + 1)
      queue.push(w)
    }
  }
  return dist.get(y)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
