const MOVES = [['U', -1, 0, 'D'], ['D', 1, 0, 'U'], ['L', 0, -1, 'R'], ['R', 0, 1, 'L']]

// Test double for the hidden grid: grid cells are 0 blocked, 1 open, 2 target, -1 robot.
export function makeMaster(grid) {
  const rows = grid.length, cols = grid[0].length
  let r = 0, c = 0
  grid.forEach((row, i) => row.forEach((v, j) => { if (v === -1) { r = i; c = j } }))
  const open = (i, j) => i >= 0 && j >= 0 && i < rows && j < cols && grid[i][j] !== 0
  const step = d => MOVES.find(m => m[0] === d)
  return {
    canMove: d => { const m = step(d); return open(r + m[1], c + m[2]) },
    move: d => { const m = step(d); if (open(r + m[1], c + m[2])) { r += m[1]; c += m[2] } },
    isTarget: () => grid[r][c] === 2,
  }
}

// Explore everything reachable with depth-first search and backtracking, then breadth-first search on what was learned.
export function findShortestPath(master) {
  const key = (i, j) => `${i},${j}`
  const seen = new Set([key(0, 0)])
  let target = master.isTarget() ? [0, 0] : null
  const dfs = (i, j) => {
    for (const [d, di, dj, back] of MOVES) {
      const ni = i + di, nj = j + dj
      if (master.canMove(d) && !seen.has(key(ni, nj))) {
        seen.add(key(ni, nj))
        master.move(d)
        if (target === null && master.isTarget()) target = [ni, nj]
        dfs(ni, nj)
        master.move(back)
      }
    }
  }
  dfs(0, 0)
  if (target === null) return -1
  const dist = new Map([[key(0, 0), 0]])
  const queue = [[0, 0]]
  for (let head = 0; head < queue.length; head++) {
    const [i, j] = queue[head]
    if (i === target[0] && j === target[1]) return dist.get(key(i, j))
    for (const [, di, dj] of MOVES) {
      const k = key(i + di, j + dj)
      if (seen.has(k) && !dist.has(k)) { dist.set(k, dist.get(key(i, j)) + 1); queue.push([i + di, j + dj]) }
    }
  }
  return -1
}
