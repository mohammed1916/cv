const MOVES = [['U', -1, 0, 'D'], ['D', 1, 0, 'U'], ['L', 0, -1, 'R'], ['R', 0, 1, 'L']]

// Test double: grid holds entry costs (0 blocked). move returns the cost paid, or -1 when blocked.
export function makeMaster(grid, [r1, c1], [r2, c2]) {
  const rows = grid.length, cols = grid[0].length
  let r = r1, c = c1
  const open = (i, j) => i >= 0 && j >= 0 && i < rows && j < cols && grid[i][j] !== 0
  const step = d => MOVES.find(m => m[0] === d)
  return {
    canMove: d => { const m = step(d); return open(r + m[1], c + m[2]) },
    move: d => {
      const m = step(d), ni = r + m[1], nj = c + m[2]
      if (!open(ni, nj)) return -1
      r = ni; c = nj
      return grid[ni][nj]
    },
    isTarget: () => r === r2 && c === c2,
  }
}

// Explore with depth-first search (recording the cost of entering each cell), then run Dijkstra on the recorded costs.
export function findMinCost(master) {
  const key = (i, j) => `${i},${j}`
  const cost = new Map([[key(0, 0), 0]])
  let target = master.isTarget() ? [0, 0] : null
  const dfs = (i, j) => {
    for (const [d, di, dj, back] of MOVES) {
      const ni = i + di, nj = j + dj
      if (master.canMove(d) && !cost.has(key(ni, nj))) {
        cost.set(key(ni, nj), master.move(d))
        if (target === null && master.isTarget()) target = [ni, nj]
        dfs(ni, nj)
        master.move(back)
      }
    }
  }
  dfs(0, 0)
  if (target === null) return -1
  const dist = new Map([[key(0, 0), 0]])
  const done = new Set()
  while (true) {
    let best = null
    for (const [k, d] of dist) if (!done.has(k) && (best === null || d < dist.get(best))) best = k
    if (best === null) return -1
    if (best === key(...target)) return dist.get(best)
    done.add(best)
    const [i, j] = best.split(',').map(Number)
    for (const [, di, dj] of MOVES) {
      const k = key(i + di, j + dj)
      if (cost.has(k) && !done.has(k)) {
        const candidate = dist.get(best) + cost.get(k)
        if (!dist.has(k) || candidate < dist.get(k)) dist.set(k, candidate)
      }
    }
  }
}
