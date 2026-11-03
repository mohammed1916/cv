export const phases = [
  { id: 'setup', label: 'Walls', description: 'Store the blocked cells and compute the enclosure limit from their count.' },
  { id: 'source', label: 'From start', description: 'Explore outward from the start cell until the goal is reached, the search escapes the limit, or the region closes.' },
  { id: 'target', label: 'From goal', description: 'If the start looked enclosed, explore outward from the goal the same way.' },
  { id: 'decide', label: 'Decide', description: 'Combine the two explorations into one yes or no answer.' },
]

const GRID = 1000000
const MAX_WALLS = 200

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.blocked) || !Array.isArray(data.source) || !Array.isArray(data.target)) {
    throw new Error('Enter {"blocked": [[r,c],...], "source": [r,c], "target": [r,c]}.')
  }
  if (data.blocked.length > MAX_WALLS) throw new Error(`At most ${MAX_WALLS} blocked cells.`)
  const inside = ([r, c]) => Number.isInteger(r) && Number.isInteger(c) && r >= 0 && c >= 0 && r < GRID && c < GRID
  if (!data.source.length || !inside(data.source) || data.source.length !== 2) throw new Error('The source must be a cell [row, column] inside the grid.')
  if (data.target.length !== 2 || !inside(data.target)) throw new Error('The target must be a cell [row, column] inside the grid.')
  const seen = new Set()
  for (const cell of data.blocked) {
    if (cell.length !== 2 || !inside(cell)) throw new Error('Every blocked cell must be a [row, column] inside the grid.')
    const key = `${cell[0]},${cell[1]}`
    if (seen.has(key)) throw new Error('Blocked cells must be distinct.')
    seen.add(key)
  }
  if (seen.has(`${data.source[0]},${data.source[1]}`) || seen.has(`${data.target[0]},${data.target[1]}`)) throw new Error('The source and target cannot be blocked.')
  return { blocked: data.blocked, source: data.source, target: data.target }
}

// Explores at most limit + 1 distinct cells from start. Returns 'found', 'open' (more than limit cells reached) or 'closed'.
function explore(start, goal, walls, limit, size, role, record) {
  const key = (r, c) => r * size + c
  const seen = new Set([key(start[0], start[1])])
  const queue = [start]
  let head = 0
  const snap = (cur, status) => ({ role, origin: start, current: cur, seen: seen.size, limit, status, goal })
  while (head < queue.length) {
    const [r, c] = queue[head++]
    record?.({ phase: role, activeLine: 13, message: `Expand (${r}, ${c}). ${seen.size} cell${seen.size === 1 ? '' : 's'} seen so far; the limit is ${limit}.`, snapshot: snap([r, c], 'walking') })
    for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
      if (nr < 0 || nc < 0 || nr >= size || nc >= size || walls.has(key(nr, nc))) continue
      if (nr === goal[0] && nc === goal[1]) {
        record?.({ phase: role, activeLine: 15, message: `Reached the goal from (${r}, ${c}). These two cells are connected.`, snapshot: snap([nr, nc], 'found') })
        return 'found'
      }
      const k = key(nr, nc)
      if (seen.has(k)) continue
      seen.add(k)
      queue.push([nr, nc])
      if (seen.size > limit) {
        record?.({ phase: role, activeLine: 16, message: `More than ${limit} cells are reachable, so this start cannot be enclosed by the walls.`, snapshot: snap([nr, nc], 'open') })
        return 'open'
      }
    }
  }
  record?.({ phase: role, activeLine: 17, message: `The region has only ${seen.size} cells and no way out. It is enclosed.`, snapshot: snap(null, 'closed') })
  return 'closed'
}

function solve(input, size, record) {
  const { blocked, source, target } = input
  const walls = new Set(blocked.map(([r, c]) => r * size + c))
  const k = blocked.length
  const limit = k * (k - 1) / 2
  if (source[0] === target[0] && source[1] === target[1]) {
    record?.({ phase: 'decide', activeLine: 3, message: 'The start and goal are the same cell, so the answer is yes.', snapshot: { role: 'decide', origin: source, goal: target, current: null, seen: 0, limit, status: 'same', result: true } })
    return true
  }
  record?.({ phase: 'setup', activeLine: 4, message: `${k} blocked cell${k === 1 ? '' : 's'} gives a limit of ${limit}: an enclosed region cannot hold more cells than that.`, snapshot: { role: 'setup', origin: source, goal: target, current: null, seen: 0, limit, status: 'setup' } })
  const s = explore(source, target, walls, limit, size, 'source', record)
  if (s === 'found') return true
  if (s === 'closed') return false
  const t = explore(target, source, walls, limit, size, 'target', record)
  const result = t !== 'closed'
  record?.({ phase: 'decide', activeLine: 9, message: result ? 'The goal side escapes the limit too, so both sides reach the open part of the grid.' : 'The goal side is enclosed, so no path exists.', snapshot: { role: 'decide', origin: source, goal: target, current: null, seen: 0, limit, status: result ? 'open' : 'closed', result } })
  return result
}

// Returns true when the start can reach the goal on a size × size grid (default 1,000,000) avoiding the blocked cells.
export function solveEscape(input, size = GRID) {
  return solve(input, size, null)
}

export function buildTrace(input) {
  const frames = []
  const result = solve(input, GRID, f => frames.push(f))
  return { input, result, frames }
}

export const code = [
  'FUNCTION canEscape(blocked, source, target)',
  '    walls ← set of blocked cells ; k ← count of blocked cells',
  '    IF source = target THEN RETURN true',
  '    limit ← k × (k − 1) / 2',
  '    s ← explore(source, target, walls, limit)',
  '    IF s = found THEN RETURN true',
  '    IF s = closed THEN RETURN false',
  '    t ← explore(target, source, walls, limit)',
  '    RETURN t ≠ closed',
  'FUNCTION explore(start, goal, walls, limit)',
  '    queue ← [start] ; seen ← {start}',
  '    WHILE queue is not empty',
  '        cell ← pop the front of the queue',
  '        FOR each neighbour x of cell inside the grid and not a wall',
  '            IF x = goal THEN RETURN found',
  '            IF x is new THEN mark it and push it ; IF |seen| > limit THEN RETURN open',
  '    RETURN closed',
]

export const python = `from collections import deque

def can_escape(blocked, source, target, n=1_000_000):
    walls = {tuple(cell) for cell in blocked}
    k = len(walls)
    if source == target:
        return True
    limit = k * (k - 1) // 2
    s = explore(source, target, walls, limit, n)
    if s == 'found':
        return True
    if s == 'closed':
        return False
    t = explore(target, source, walls, limit, n)
    return t != 'closed'

def explore(start, goal, walls, limit, n):
    queue = deque([start])
    seen = {start}
    while queue:
        r, c = queue.popleft()
        for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if not (0 <= nr < n and 0 <= nc < n) or (nr, nc) in walls:
                continue
            if (nr, nc) == goal:
                return 'found'
            if (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append((nr, nc))
                if len(seen) > limit:
                    return 'open'
    return 'closed'`

export const pythonLineMap = { 1: 3, 2: 4, 3: 6, 4: 8, 5: 9, 6: 10, 7: 12, 8: 14, 9: 15, 10: 17, 11: 18, 12: 20, 13: 21, 14: 22, 15: 25, 16: 27, 17: 32 }
