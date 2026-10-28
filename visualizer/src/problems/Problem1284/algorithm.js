export function parseInput(text) {
  const mat = JSON.parse(text)
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 3 || mat.some(row => !Array.isArray(row) || row.length !== mat[0].length || row.length < 1 || row.length > 3)) throw new Error('Use a matrix of 1 to 3 rows and 1 to 3 columns.')
  if (mat.some(row => row.some(v => v !== 0 && v !== 1))) throw new Error('Cells are 0 or 1.')
  return mat
}

export function buildTrace(mat) {
  const m = mat.length, n = mat[0].length
  const bit = (r, c) => 1 << (r * n + c)
  let start = 0
  mat.forEach((row, r) => row.forEach((v, c) => { if (v) start |= bit(r, c) }))
  // Flipping a cell toggles that cell and its up, down, left and right neighbours.
  const toggles = []
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
    let t = 0
    for (const [dr, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const rr = r + dr, cc = c + dc
      if (rr >= 0 && rr < m && cc >= 0 && cc < n) t |= bit(rr, cc)
    }
    toggles.push(t)
  }
  const dist = new Map([[start, 0]])
  const queue = [start]
  const frames = [{ phase: 'start', activeLine: L('encode the matrix'), mask: start, flips: 0, message: `Encode the matrix as bits. The start state is ${start}.` }]
  let answer = -1
  for (let head = 0; head < queue.length; head++) {
    const mask = queue[head]
    const flips = dist.get(mask)
    if (mask === 0) { answer = flips; break }
    frames.push({ phase: 'explore', activeLine: L('for each cell'), mask, flips, message: `State ${mask} is reached with ${flips} flip(s).` })
    for (const t of toggles) {
      const next = mask ^ t
      if (!dist.has(next)) { dist.set(next, flips + 1); queue.push(next) }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), mask: answer === -1 ? start : 0, flips: answer, message: answer === -1 ? 'No sequence of flips clears the matrix.' : `The all zero matrix needs ${answer} flip(s).` })
  return { input: mat, result: answer, frames }
}

export const code = `minimum flips to reach an all zero matrix:
  encode the matrix as a bit mask
  set the queue to hold the mask with zero flips
  set seen to hold the start mask
  while the queue is not empty
    take the next mask from the queue
    if the mask is zero then return its flip count
    for each cell, flip the cell and its neighbours to get a new mask
      if the new mask is not seen then add it to seen and the queue
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque


def min_flips(mat):
    m, n = len(mat), len(mat[0])
    start = 0
    for r in range(m):
        for c in range(n):
            if mat[r][c]:
                start |= 1 << (r * n + c)
    toggles = []
    for r in range(m):
        for c in range(n):
            t = 0
            for dr, dc in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)):
                rr, cc = r + dr, c + dc
                if 0 <= rr < m and 0 <= cc < n:
                    t |= 1 << (rr * n + cc)
            toggles.append(t)
    dist = {start: 0}
    queue = deque([start])
    while queue:
        mask = queue.popleft()
        if mask == 0:
            return dist[mask]
        for t in toggles:
            nxt = mask ^ t
            if nxt not in dist:
                dist[nxt] = dist[mask] + 1
                queue.append(nxt)
    return -1
`
