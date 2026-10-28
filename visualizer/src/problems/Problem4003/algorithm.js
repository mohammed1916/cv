export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object') throw new Error('Use an object with m, n and penalty.')
  const { m, n, penalty } = obj
  if (!Number.isInteger(m) || !Number.isInteger(n) || m < 1 || n < 1) throw new Error('m and n must be positive integers.')
  if (m * n < 2 || m * n > 16) throw new Error('Use a grid with 2 to 16 cells for the visualization.')
  if (!Array.isArray(penalty) || penalty.length !== m || penalty.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('penalty must have m rows of n integers.')
  if (penalty.some(row => row.some(v => !Number.isInteger(v) || v < 0 || v > 100000))) throw new Error('Each penalty must be an integer from 0 to 100000.')
  return { m, n, penalty }
}

export function buildTrace(input) {
  const { m, n, penalty } = input
  const entry = (i, j) => (i + 1) * (j + 1)
  // A state is a cell plus the parity of the next action: 0 is odd, 1 is even.
  const key = (i, j, p) => (i * n + j) * 2 + p
  const dist = new Map([[key(0, 0, 0), entry(0, 0)]])
  const settled = new Set()
  const frames = [{ phase: 'start', activeLine: L('set the cost of the start state'), i: 0, j: 0, parity: 'odd', cost: entry(0, 0), message: 'Start at (0, 0) and pay its entry cost. The first action is odd.' }]
  let answer = null
  for (;;) {
    let current = null
    for (const [k, c] of dist) {
      if (!settled.has(k) && (current === null || c < dist.get(current))) current = k
    }
    if (current === null) break
    const cost = dist.get(current)
    settled.add(current)
    const p = current % 2
    const cell = (current - p) / 2
    const i = Math.floor(cell / n)
    const j = cell % n
    const parity = p === 0 ? 'odd' : 'even'
    if (i === m - 1 && j === n - 1) {
      answer = cost
      frames.push({ phase: 'done', activeLine: L('if it is the bottom right cell'), i, j, parity, cost, message: `Reached the bottom right cell with cost ${cost}.` })
      break
    }
    frames.push({ phase: 'settle', activeLine: L('take the unsettled state'), i, j, parity, cost, message: `Settle (${i}, ${j}) with an ${parity} next action at cost ${cost}.` })
    const relax = (ni, nj, extra) => {
      const k = key(ni, nj, 1 - p)
      if (!dist.has(k) || cost + extra < dist.get(k)) dist.set(k, cost + extra)
    }
    relax(i, j, penalty[i][j])
    for (const [di, dj] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const ni = i + di
      const nj = j + dj
      if (ni < 0 || nj < 0 || ni >= m || nj >= n) continue
      const compliant = p === 0 ? di === 1 || dj === 1 : di === -1 || dj === -1
      relax(ni, nj, entry(ni, nj) + (compliant ? 0 : penalty[i][j]))
    }
  }
  return { input, result: answer, frames }
}

export const code = `minimum cost path with alternating directions(m, n, penalty)
  set the cost of the start state at (0, 0) with an odd next action to its entry cost
  repeat until no unsettled state remains
    take the unsettled state with the least cost
    if it is the bottom right cell then return its cost
    settle it
    relax the wait, which costs the penalty here and flips the parity
    for each adjacent cell do
      relax the move, paying its entry cost plus the penalty here unless the move is compliant
  return no answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq


def min_cost_path(m, n, penalty):
    def entry(i, j):
        return (i + 1) * (j + 1)

    dist = {(0, 0, 0): entry(0, 0)}
    heap = [(entry(0, 0), 0, 0, 0)]
    while heap:
        d, i, j, p = heapq.heappop(heap)
        if dist.get((i, j, p)) != d:
            continue
        if i == m - 1 and j == n - 1:
            return d
        options = [(i, j, 1 - p, penalty[i][j])]
        for di, dj in ((0, 1), (1, 0), (0, -1), (-1, 0)):
            ni, nj = i + di, j + dj
            if 0 <= ni < m and 0 <= nj < n:
                compliant = (di == 1 or dj == 1) if p == 0 else (di == -1 or dj == -1)
                cost = entry(ni, nj) + (0 if compliant else penalty[i][j])
                options.append((ni, nj, 1 - p, cost))
        for ni, nj, np_, cost in options:
            nd = d + cost
            if nd < dist.get((ni, nj, np_), float('inf')):
                dist[(ni, nj, np_)] = nd
                heapq.heappush(heap, (nd, ni, nj, np_))
    return None
`
