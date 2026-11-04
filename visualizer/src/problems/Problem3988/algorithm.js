export const phases = [
  { id: 'limit', label: 'Limit', description: 'A fully free grid has the most routes possible.' },
  { id: 'plan', label: 'Plan', description: 'Choose which shape produces k routes.' },
  { id: 'carve', label: 'Carve', description: 'Open one free cell.' },
  { id: 'count', label: 'Count', description: 'Routes into a cell come from above and from the left.' },
  { id: 'path', label: 'Routes', description: 'Trace each counted route.' },
  { id: 'done', label: 'Result', description: 'Return the grid or an empty list.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with m, n and k.')
  const { m, n, k } = input
  if (![m, n].every(value => Number.isInteger(value) && value >= 1 && value <= 10)) throw new Error('m and n are integers from 1 to 10.')
  if (!Number.isInteger(k) || k < 1 || k > 4) throw new Error('k is an integer from 1 to 4.')
  return { m, n, k }
}

export const code = `build a grid with exactly k routes
  count the routes of a fully free grid, the largest possible
  if k is larger than that, return an empty list
  if k is 4 and both sides are at least 3, chain two diamonds
  otherwise open a corridor with a two-row strip k columns wide
  open each planned cell and leave the rest blocked
  routes into a free cell = routes from above + routes from the left
  confirm the corner count equals k
  return the rows as strings`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `from math import comb


def create_grid(m, n, k):
    if k > comb(m + n - 2, m - 1):
        return []
    if k == 4 and m >= 3 and n >= 3:
        free = [(0, 0), (0, 1), (1, 0), (1, 1), (1, 2), (2, 1), (2, 2)]
        free += [(2, c) for c in range(3, n)]
        free += [(r, n - 1) for r in range(3, m)]
    else:
        swap = n < k
        rows, cols = (n, m) if swap else (m, n)
        free = [(0, c) for c in range(cols)]
        if k > 1:
            free += [(1, c) for c in range(cols - k, cols)]
        free += [(r, cols - 1) for r in range(1, rows)]
        if swap:
            free = [(c, r) for r, c in free]
    grid = [['#'] * n for _ in range(m)]
    for r, c in free:
        grid[r][c] = '.'
    ways = [[0] * n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            if grid[r][c] == '.':
                up = ways[r - 1][c] if r else 0
                left = ways[r][c - 1] if c else 0
                ways[r][c] = up + left if r or c else 1
    assert ways[m - 1][n - 1] == k
    return [''.join(row) for row in grid]
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

function planCells(m, n, k) {
  if (k === 4 && m >= 3 && n >= 3) {
    const cells = [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [2, 1], [2, 2]]
    for (let c = 3; c < n; c++) cells.push([2, c])
    for (let r = 3; r < m; r++) cells.push([r, n - 1])
    return { cells, shape: 'diamonds', swap: false }
  }
  const swap = n < k
  const [rows, cols] = swap ? [n, m] : [m, n]
  const cells = []
  for (let c = 0; c < cols; c++) cells.push([0, c])
  if (k > 1) for (let c = cols - k; c < cols; c++) cells.push([1, c])
  for (let r = 1; r < rows; r++) cells.push([r, cols - 1])
  const unique = [...new Map(cells.map(cell => [String(cell), cell])).values()]
  return { cells: swap ? unique.map(([r, c]) => [c, r]) : unique, shape: 'strip', swap }
}

function listPaths(grid) {
  const m = grid.length, n = grid[0].length
  const paths = []
  const walk = (r, c, path) => {
    if (r >= m || c >= n || grid[r][c] !== '.') return
    const next = [...path, [r, c]]
    if (r === m - 1 && c === n - 1) { paths.push(next); return }
    walk(r, c + 1, next)
    walk(r + 1, c, next)
  }
  walk(0, 0, [])
  return paths
}

export function buildTrace({ m, n, k }) {
  const freeWays = Array.from({ length: m }, () => Array(n).fill(1))
  for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) freeWays[r][c] = freeWays[r - 1][c] + freeWays[r][c - 1]
  const limit = freeWays[m - 1][n - 1]
  const frames = []
  let grid = Array.from({ length: m }, () => Array(n).fill('#'))
  let ways = Array.from({ length: m }, () => Array(n).fill(null))
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, grid: grid.map(row => row.join('')), ways: ways.map(row => [...row]),
    active: null, from: [], path: null, pathIndex: -1, ...extra,
  })
  push('limit', L('count the routes'), P('if k > comb'), `With nothing blocked, a ${m} by ${n} grid has ${limit} route${limit === 1 ? '' : 's'}. Blocking cells can only remove routes, so ${limit} is the ceiling.`, { showLimit: true })
  if (k > limit) {
    push('done', L('if k is larger'), P('return []'), `k = ${k} is above the ceiling of ${limit}, so no grid works. Return an empty list.`, { showLimit: true })
    return { input: { m, n, k }, limit, result: [], plan: null, paths: [], frames }
  }
  const plan = planCells(m, n, k)
  const planNote = plan.shape === 'diamonds'
    ? 'A 2 by 2 free block gives 2 routes. Two of them joined corner to corner give 2 × 2 = 4, and a single corridor leads on to the end.'
    : k === 1 ? 'One corridor along the edge gives exactly one route.'
      : `In a free strip with two ${plan.swap ? 'columns' : 'rows'}, a route picks one of its ${k} ${plan.swap ? 'rows' : 'columns'} to step across, which gives ${k} routes.`
  push('plan', L(plan.shape === 'diamonds' ? 'chain two diamonds' : 'otherwise open'), P(plan.shape === 'diamonds' ? 'free = [(0, 0)' : 'free = [(0, c)'), planNote)
  for (const [r, c] of plan.cells) {
    grid[r][c] = '.'
    push('carve', L('open each planned'), P("grid[r][c] = '.'"), `Open cell (${r}, ${c}).`, { active: [r, c] })
  }
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== '.') continue
      const up = r ? ways[r - 1][c] ?? 0 : 0
      const left = c ? ways[r][c - 1] ?? 0 : 0
      ways[r][c] = r || c ? up + left : 1
      const from = []
      if (r && up) from.push([r - 1, c])
      if (c && left) from.push([r, c - 1])
      push('count', L('routes into a free'), P('ways[r][c] = up + left'), r || c ? `Cell (${r}, ${c}): ${up} from above + ${left} from the left = ${ways[r][c]}.` : 'The start cell has one route: standing on it.', { active: [r, c], from })
    }
  }
  const paths = listPaths(grid)
  paths.forEach((path, index) => push('path', L('confirm the corner'), P('assert ways[m - 1]'), `Route ${index + 1} of ${paths.length}: ${path.map(([r, c]) => `(${r},${c})`).join(' → ')}.`, { path, pathIndex: index }))
  const result = grid.map(row => row.join(''))
  push('done', L('return the rows'), P("return [''.join"), `The corner shows ${ways[m - 1][n - 1]}, which matches k = ${k}. Return the ${m} rows.`)
  return { input: { m, n, k }, limit, result, plan, paths, frames }
}
