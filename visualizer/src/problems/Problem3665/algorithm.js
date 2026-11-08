const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 2 || grid.length > 6) throw new Error('grid has 2 to 6 rows.')
  const n = grid[0].length
  if (n < 2 || n > 6) throw new Error('Each row has 2 to 6 cells.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== n || !row.every(c => c === 0 || c === 1)) throw new Error('Every row must be 0 or 1 with equal length.')
  }
  if (grid[0][0] !== 0 || grid[grid.length - 1][n - 1] !== 0) throw new Error('The start and finish cells must be empty (0).')
  return { grid }
}

// One robot move from (i, j) in direction 'R' or 'D'. A mirror turns the robot and it steps again from that mirror.
export function resolve(grid, i, j, dir) {
  const m = grid.length
  const n = grid[0].length
  let r = i + (dir === 'D' ? 1 : 0)
  let c = j + (dir === 'R' ? 1 : 0)
  const cells = []
  if (r >= m || c >= n) return { cells, dest: null, status: 'edge' }
  cells.push([r, c])
  while (grid[r][c] === 1) {
    dir = dir === 'R' ? 'D' : 'R'
    r += dir === 'D' ? 1 : 0
    c += dir === 'R' ? 1 : 0
    if (r >= m || c >= n) return { cells, dest: null, status: 'out' }
    cells.push([r, c])
  }
  return { cells, dest: [r, c], status: 'ok' }
}

const name = dir => (dir === 'R' ? 'Right' : 'Down')

export function buildTrace({ grid }) {
  const m = grid.length
  const n = grid[0].length
  const ways = grid.map(row => row.map(() => 0))
  ways[0][0] = 1
  const snap = () => ways.map(row => [...row])
  const frames = [{ phase: 'start', ways: snap(), at: [0, 0], dir: null, path: [], dest: null, status: 'start', result: null, pythonLine: P('ways = [[0]'), activeLine: L('start a ways table'), message: 'One way reaches the top-left corner.' }]
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 1 || ways[i][j] === 0) continue
      for (const dir of ['R', 'D']) {
        const res = resolve(grid, i, j, dir)
        if (res.dest) ways[res.dest[0]][res.dest[1]] = (ways[res.dest[0]][res.dest[1]] + ways[i][j]) % MOD
        const phase = res.status === 'ok' ? (res.cells.length > 1 ? 'reflect' : 'move') : 'blocked'
        const end = res.dest ? `(${res.dest[0]}, ${res.dest[1]})` : ''
        const message = res.status === 'ok'
          ? (res.cells.length > 1 ? `${name(dir)} from (${i}, ${j}) meets a mirror and reflects to ${end}.` : `${name(dir)} from (${i}, ${j}) lands on ${end}.`)
          : res.status === 'out' ? `The reflection leaves the grid, so this move is invalid.` : `${name(dir)} from (${i}, ${j}) leaves the grid.`
        frames.push({ phase, ways: snap(), at: [i, j], dir, path: res.cells, dest: res.dest, status: res.status, result: null, pythonLine: phase === 'reflect' ? P('while r < m') : phase === 'blocked' ? P('for d in') : P('if r < m and c < n'), activeLine: L('try a move right'), message })
      }
    }
  }
  const result = ways[m - 1][n - 1]
  frames.push({ phase: 'done', ways: snap(), at: [m - 1, n - 1], dir: null, path: [], dest: null, status: 'done', result, pythonLine: P('return ways'), activeLine: L('return the ways'), message: `Valid paths to the finish: ${result}.` })
  return { input: { grid }, result, frames }
}

export const code = [
  'start a ways table with one path at the top-left cell',
  'visit cells in row order',
  'skip mirror cells and cells with no paths',
  'try a move right, then a move down',
  'follow reflections while the robot lands on a mirror',
  'if it stays inside, add the paths to the landing cell',
  'return the ways for the bottom-right cell',
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_paths(grid):
    m, n = len(grid), len(grid[0])
    MOD = 1000000007
    ways = [[0] * n for _ in range(m)]
    ways[0][0] = 1
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 1 or ways[i][j] == 0:
                continue
            for d in ((0, 1), (1, 0)):
                r, c = i + d[0], j + d[1]
                while r < m and c < n and grid[r][c] == 1:
                    d = (d[1], d[0])
                    r, c = r + d[0], c + d[1]
                if r < m and c < n:
                    ways[r][c] = (ways[r][c] + ways[i][j]) % MOD
    return ways[m - 1][n - 1]
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
