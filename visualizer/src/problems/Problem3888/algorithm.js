export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid and k.')
  const { grid, k } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 4 || !Array.isArray(grid[0])) throw new Error('grid has 1 to 4 rows.')
  const n = grid[0].length
  if (n < 1 || n > 4) throw new Error('Each row has 1 to 4 values.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== n || !row.every(v => Number.isInteger(v) && v >= 0 && v <= 4)) throw new Error('Grid values are integers from 0 to 4 in a rectangle.')
  }
  if (!Number.isInteger(k) || k < 1 || k > Math.min(grid.length, n)) throw new Error('k must fit inside the grid.')
  return { grid, k }
}

// Each operation adds one to a k by k square. Scanning in row-major order, a cell still short of the target
// can only be covered by squares that start at that cell, so the count there is forced. Trying each target
// value from the current maximum up to a bound gives every feasible plan; the cheapest one is the answer.
export function buildTrace({ grid, k }) {
  const m = grid.length
  const n = grid[0].length
  const top = Math.max(...grid.flat())
  const limit = m * n * k * k * (top + 1) + 2
  const frames = []
  const snap = extra => extra
  const plan = target => {
    const need = grid.map(row => row.map(v => target - v))
    const placed = []
    let ops = 0
    for (let i = 0; i < m; i += 1) {
      for (let j = 0; j < n; j += 1) {
        const c = need[i][j]
        if (c < 0) return { ok: false, ops, placed, failAt: [i, j], need }
        if (c === 0) continue
        if (i + k > m || j + k > n) return { ok: false, ops, placed, failAt: [i, j], need }
        ops += c
        placed.push({ i, j, c })
        for (let di = 0; di < k; di += 1) for (let dj = 0; dj < k; dj += 1) need[i + di][j + dj] -= c
      }
    }
    return { ok: true, ops, placed, failAt: null, need }
  }
  frames.push(snap({ pythonLine: PY('top = max'), phase: 'start', activeLine: L('top = the largest value'), target: top, cur: null, need: null, placed: [], ops: 0, failAt: null, feasible: null, message: `Largest value is ${top}; try targets from there up to ${top + limit}.` }))
  let best = null
  let bestTarget = null
  let checked = 0
  for (let target = top; target <= top + limit; target += 1) {
    const result = plan(target)
    checked += 1
    if (result.ok && (best === null || result.ops < best)) {
      best = result.ops
      bestTarget = target
    }
    if (target === top) {
      frames.push(snap({ pythonLine: PY('for target in range'), phase: 'target', activeLine: L('for each target value'), target, cur: null, need: null, placed: [], ops: result.ops, failAt: result.failAt, feasible: result.ok, message: result.ok ? `Target ${target} works with ${result.ops} operations.` : `Target ${target} fails at row ${result.failAt[0]}, column ${result.failAt[1]}.` }))
    }
  }
  frames.push(snap({ pythonLine: PY('for target in range'), phase: 'search', activeLine: L('for each target value'), target: bestTarget, cur: null, need: null, placed: [], ops: best ?? 0, failAt: null, feasible: best !== null, message: best === null ? `No target up to ${top + limit} works.` : `Checked ${checked} targets; the cheapest works at ${bestTarget} with ${best} operations.` }))
  if (best === null) {
    frames.push(snap({ pythonLine: PY('return -1 if best'), phase: 'done', activeLine: L('else return -1'), target: null, cur: null, need: null, placed: [], ops: -1, failAt: null, feasible: false, message: 'Impossible: the grid cannot be equalized with these squares.' }))
    return { input: { grid, k }, result: -1, frames }
  }
  // Replay the chosen target cell by cell for the picture.
  const need = grid.map(row => row.map(v => bestTarget - v))
  const placed = []
  let ops = 0
  frames.push(snap({ pythonLine: PY('need = [[target'), phase: 'replay', activeLine: L('need = target minus'), target: bestTarget, cur: null, need: need.map(r => r.slice()), placed: [], ops: 0, failAt: null, feasible: true, message: `Replay target ${bestTarget}: each cell needs target minus its value.` }))
  for (let i = 0; i < m; i += 1) {
    for (let j = 0; j < n; j += 1) {
      const c = need[i][j]
      frames.push(snap({ pythonLine: PY('c = need[i][j]'), phase: 'cell', activeLine: L('for each cell in row-major order'), target: bestTarget, cur: [i, j], need: need.map(r => r.slice()), placed: placed.slice(), ops, failAt: null, feasible: true, message: `Cell (${i}, ${j}) still needs ${c}.` }))
      if (c === 0) continue
      ops += c
      placed.push({ i, j, c })
      for (let di = 0; di < k; di += 1) for (let dj = 0; dj < k; dj += 1) need[i + di][j + dj] -= c
      frames.push(snap({ pythonLine: PY('ops += c'), phase: 'place', activeLine: L('add c squares with that corner'), target: bestTarget, cur: [i, j], need: need.map(r => r.slice()), placed: placed.slice(), ops, failAt: null, feasible: true, message: `Place ${c} square${c === 1 ? '' : 's'} with corner (${i}, ${j}); ${ops} operations so far.` }))
    }
  }
  frames.push(snap({ pythonLine: PY('return -1 if best'), phase: 'done', activeLine: L('if best exists return best'), target: bestTarget, cur: null, need: need.map(r => r.slice()), placed: placed.slice(), ops, failAt: null, feasible: true, message: `Minimum operations: ${ops}.` }))
  return { input: { grid, k }, result: ops, frames }
}

export const code = `minimum operations to make every grid value equal, or -1
  top = the largest value in the grid
  best = nothing yet
  for each target value from top up to a bound
    need = target minus each cell's value
    for each cell in row-major order
      c = need at this cell
      if c is negative or the k by k square does not fit then this target fails
      add c squares with that corner and subtract them over the square
    if the target works and its operations beat best then keep it
  if best exists return best, else return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def min_ops(grid, k):
    m, n = len(grid), len(grid[0])
    top = max(max(row) for row in grid)
    limit = m * n * k * k * (top + 1) + 2
    best = None
    for target in range(top, top + limit + 1):
        need = [[target - grid[i][j] for j in range(n)] for i in range(m)]
        ops = 0
        ok = True
        for i in range(m):
            for j in range(n):
                c = need[i][j]
                if c < 0 or (c > 0 and (i + k > m or j + k > n)):
                    ok = False
                    break
                if c == 0:
                    continue
                ops += c
                for di in range(k):
                    for dj in range(k):
                        need[i + di][j + dj] -= c
            if not ok:
                break
        if ok and (best is None or ops < best):
            best = ops
    return -1 if best is None else best
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
