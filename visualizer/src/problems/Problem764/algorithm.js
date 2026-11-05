export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, mines } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n must be an integer from 1 to 12.')
  if (!Array.isArray(mines) || mines.length > n * n || mines.some(m => !Array.isArray(m) || m.length !== 2 || !Number.isInteger(m[0]) || !Number.isInteger(m[1]) || m[0] < 0 || m[0] >= n || m[1] < 0 || m[1] >= n)) {
    throw new Error('mines is a list of [row, column] cells inside the n by n grid.')
  }
  return { n, mines }
}

const JS_LINES = [
  'function orderOfLargestPlusSign(n, mines) {',
  '  const blocked = new Set(mines.map(([r, c]) => r + \',\' + c))',
  '  const grid = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => !blocked.has(r + \',\' + c) ? 1 : 0))',
  '  let best = 0',
  '  for (let r = 0; r < n; r++) {',
  '    for (let c = 0; c < n; c++) {',
  '      let arm = 0 // the largest k so that the plus of radius k is all ones',
  '      while (r - arm >= 0 && r + arm < n && c - arm >= 0 && c + arm < n && grid[r - arm][c] && grid[r + arm][c] && grid[r][c - arm] && grid[r][c + arm]) arm++',
  '      best = Math.max(best, arm) // a plus centred here has radius arm',
  '    }',
  '  }',
  '  return best // return the order of the largest plus',
  '}',
]
const PY_LINES = [
  'def order_of_largest_plus_sign(n, mines):',
  '    blocked = {tuple(m) for m in mines}',
  '    grid = [[0 if (r, c) in blocked else 1 for c in range(n)] for r in range(n)]',
  '    best = 0',
  '    for r in range(n):',
  '        for c in range(n):',
  '            arm = 0',
  '            while r - arm >= 0 and r + arm < n and c - arm >= 0 and c + arm < n and grid[r - arm][c] and grid[r + arm][c] and grid[r][c - arm] and grid[r][c + arm]:',
  '                arm += 1',
  '            best = max(best, arm)',
  '    return best',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// The order at a centre is how far the plus can extend in all four directions while every cell stays a 1.
export function buildTrace({ n, mines }) {
  const blocked = new Set(mines.map(([r, c]) => `${r},${c}`))
  const grid = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (blocked.has(`${r},${c}`) ? 0 : 1)))
  let best = 0, bestCell = null
  const frames = [{ phase: 'start', cell: null, arm: 0, best: 0, bestCell: null, grid: grid.map(r => [...r]), activeLine: L('const blocked'), pythonLine: P('blocked = '), message: 'Mines are zeros. Each cell is tried as the centre of a plus.' }]
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!grid[r][c]) {
        frames.push({ phase: 'skip', cell: [r, c], arm: 0, best, bestCell, grid: grid.map(row => [...row]), activeLine: L('let arm = 0'), pythonLine: P('arm = 0'), message: `(${r}, ${c}) is a mine, so no plus can be centred here.` })
        continue
      }
      let arm = 0
      while (r - arm >= 0 && r + arm < n && c - arm >= 0 && c + arm < n && grid[r - arm][c] && grid[r + arm][c] && grid[r][c - arm] && grid[r][c + arm]) arm++
      if (arm > best) { best = arm; bestCell = [r, c] }
      frames.push({ phase: 'arm', cell: [r, c], arm, best, bestCell, grid: grid.map(row => [...row]), activeLine: L('best = Math.max(best, arm)'), pythonLine: P('best = max(best, arm)'),
        message: `Centred at (${r}, ${c}), the plus reaches ${arm} cell${arm === 1 ? '' : 's'} in each direction.` })
    }
  }
  frames.push({ phase: 'done', cell: bestCell, arm: best, best, bestCell, grid: grid.map(row => [...row]), result: best, activeLine: L('return the order'), pythonLine: P('return best'), message: `The largest plus has order ${best}.` })
  return { input: { n, mines }, result: best, frames }
}
