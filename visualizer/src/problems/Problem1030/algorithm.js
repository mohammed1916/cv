export const phases = [
  { id: 'start', label: 'Centre', description: 'Start a queue at the chosen centre cell.' },
  { id: 'expand', label: 'Expand', description: 'Pop the nearest unlisted cell, record it, and queue its unseen neighbours.' },
  { id: 'done', label: 'Order', description: 'The recorded order lists every cell by nondecreasing Manhattan distance.' },
]

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length !== 4 || values.some(v => !Number.isInteger(v))) throw new Error('Enter [rows, cols, centreRow, centreCol] as four integers.')
  const [rows, cols, r, c] = values
  if (rows < 1 || cols < 1 || rows * cols > 400) throw new Error('Use 1 ≤ rows and cols with rows × cols at most 400 for the trace.')
  if (r < 0 || r >= rows || c < 0 || c >= cols) throw new Error('The centre must lie inside the grid.')
  return values
}

export function buildTrace(values) {
  const [rows, cols, r0, c0] = values
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false))
  const queue = [[r0, c0]]
  seen[r0][c0] = true
  const order = []
  const frames = []
  const dist = (r, c) => Math.abs(r - r0) + Math.abs(c - c0)
  const snap = (cur) => ({ rows, cols, centre: [r0, c0], current: cur, order: order.map(x => x.slice()), queue: queue.map(x => x.slice()) })
  frames.push({ phase: 'start', activeLine: 2, message: `Start at the centre (${r0}, ${c0}). Its distance is 0.`, snapshot: snap(null) })
  let head = 0
  while (head < queue.length) {
    const [r, c] = queue[head++]
    order.push([r, c])
    frames.push({ phase: 'expand', activeLine: 6, message: `Pop (${r}, ${c}) at distance ${dist(r, c)} and append it to the order.`, snapshot: snap([r, c]) })
    for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || seen[nr][nc]) continue
      seen[nr][nc] = true
      queue.push([nr, nc])
    }
  }
  frames.push({ phase: 'done', activeLine: 10, message: `All ${order.length} cells are listed in distance order.`, snapshot: snap(null) })
  return { input: values, result: order, frames }
}

export const code = [
  'FUNCTION cellsByDistance(rows, cols, r0, c0)',
  '    queue ← [(r0, c0)] ; mark (r0, c0) as seen',
  '    order ← empty list',
  '    WHILE queue is not empty',
  '        (r, c) ← pop the front of the queue',
  '        append (r, c) to order',
  '        FOR each neighbour (nr, nc) of (r, c)',
  '            IF (nr, nc) is inside the grid and not seen THEN',
  '                mark (nr, nc) as seen ; push it',
  '    RETURN order',
]

export const python = `from collections import deque

def cells_by_distance(rows, cols, r0, c0):
    queue = deque([(r0, c0)])
    seen = {(r0, c0)}
    order = []
    while queue:
        r, c = queue.popleft()
        order.append([r, c])
        for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append((nr, nc))
    return order`

export const pythonLineMap = { 2: 4, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14 }
