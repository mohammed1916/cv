const LIMIT = 1000000000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length !== 4) throw new Error('Use [sx, sy, tx, ty].')
  if (input.some(v => !Number.isInteger(v) || v < 0 || v > LIMIT)) throw new Error('Values are integers from 0 to 1000000000.')
  const [sx, sy, tx, ty] = input
  if (sx > tx || sy > ty) throw new Error('Use sx <= tx and sy <= ty.')
  return input
}

// States that could have been reached just before (x, y) by one move.
function predecessors(x, y) {
  const out = []
  if (x - y >= 0 && x - y <= y) out.push([x - y, y])
  if (x % 2 === 0 && x / 2 >= y) out.push([x / 2, y])
  if (y - x >= 0 && y - x <= x) out.push([x, y - x])
  if (y % 2 === 0 && y / 2 >= x) out.push([x, y / 2])
  return out
}

export function buildTrace(input) {
  const [sx, sy, tx, ty] = input
  const key = (x, y) => `${x},${y}`
  const parent = new Map([[key(tx, ty), null]])
  const dist = new Map([[key(tx, ty), 0]])
  const queue = [[tx, ty]]
  const frames = [{ phase: 'start', activeLine: L('start a queue'), state: [tx, ty], distance: 0, message: `Start at the target (${tx}, ${ty}) and undo moves until reaching (${sx}, ${sy}).` }]
  let found = false
  for (let head = 0; head < queue.length; head++) {
    const [x, y] = queue[head]
    frames.push({ phase: 'visit', activeLine: L('take the next state'), state: [x, y], distance: dist.get(key(x, y)), message: `Visit (${x}, ${y}) at distance ${dist.get(key(x, y))}.` })
    if (x === sx && y === sy) { found = true; break }
    for (const [a, b] of predecessors(x, y)) {
      if (a < sx || b < sy || parent.has(key(a, b))) continue
      parent.set(key(a, b), [x, y])
      dist.set(key(a, b), dist.get(key(x, y)) + 1)
      queue.push([a, b])
    }
  }
  const result = found ? dist.get(key(sx, sy)) : -1
  frames.push({ phase: 'done', activeLine: L('return -1'), state: found ? [sx, sy] : null, distance: result, message: found ? `Reached (${sx}, ${sy}) in ${result} moves.` : `No state reaches (${sx}, ${sy}), so the answer is -1.` })
  return { input, result, frames }
}

export const code = `fewest moves to reach the target (sx, sy, tx, ty):
  start a queue with the target at distance 0
  repeat while the queue is not empty do
    take the next state (x, y) from the queue
    if (x, y) is the start then return its distance
    for each state (a, b) that could come just before (x, y) do
      if a and b are not below the start and (a, b) is new then
        record the distance of (a, b) as the distance of (x, y) plus 1
        add (a, b) to the queue
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque


def min_moves(sx, sy, tx, ty):
    dist = {(tx, ty): 0}
    queue = deque([(tx, ty)])
    while queue:
        x, y = queue.popleft()
        if (x, y) == (sx, sy):
            return dist[(x, y)]
        candidates = []
        if 0 <= x - y <= y:
            candidates.append((x - y, y))
        if x % 2 == 0 and x // 2 >= y:
            candidates.append((x // 2, y))
        if 0 <= y - x <= x:
            candidates.append((x, y - x))
        if y % 2 == 0 and y // 2 >= x:
            candidates.append((x, y // 2))
        for a, b in candidates:
            if a >= sx and b >= sy and (a, b) not in dist:
                dist[(a, b)] = dist[(x, y)] + 1
                queue.append((a, b))
    return -1
`
