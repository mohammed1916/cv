export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.grid)) throw new Error('Use an object with a grid.')
  const { grid } = input
  if (grid.length < 1 || grid.length > 5) throw new Error('grid has 1 to 5 rows.')
  const width = grid[0].length
  if (width < 1 || width > 5) throw new Error('grid has 1 to 5 columns.')
  if (!grid.every(row => Array.isArray(row) && row.length === width && row.every(v => Number.isInteger(v) && v >= 1 && v <= 1000))) throw new Error('Each cell is an integer from 1 to 1000 in a rectangle.')
  return { grid }
}

const twos = v => { let c = 0; while (v % 2 === 0) { v /= 2; c++ } return c }
const fives = v => { let c = 0; while (v % 5 === 0) { v /= 5; c++ } return c }

export function buildTrace({ grid }) {
  const m = grid.length
  const n = grid[0].length
  const t2 = grid.map(row => row.map(twos))
  const t5 = grid.map(row => row.map(fives))
  const frames = []
  let best = 0
  let bestPath = []
  frames.push({ pythonLine: PL('two = [['), phase: 'setup', activeLine: CL('const two ='), corner: null, arms: null, path: [], best: 0, message: `Count the factors of 2 and 5 in each of the ${m * n} cells.` })
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    const left = []; const right = []; const up = []; const down = []
    for (let k = 0; k < j; k++) left.push([i, k])
    for (let k = j + 1; k < n; k++) right.push([i, k])
    for (let k = 0; k < i; k++) up.push([k, j])
    for (let k = i + 1; k < m; k++) down.push([k, j])
    const horizontal = [{ name: 'none', cells: [] }, { name: 'left', cells: left }, { name: 'right', cells: right }]
    const vertical = [{ name: 'none', cells: [] }, { name: 'up', cells: up }, { name: 'down', cells: down }]
    let cornerBest = -1
    let cornerPath = []
    for (const h of horizontal) for (const v of vertical) {
      const cells = [[i, j], ...h.cells, ...v.cells]
      let s2 = 0, s5 = 0
      for (const [r, c] of cells) { s2 += t2[r][c]; s5 += t5[r][c] }
      const zeros = Math.min(s2, s5)
      if (zeros > cornerBest) { cornerBest = zeros; cornerPath = cells }
    }
    if (cornerBest > best) { best = cornerBest; bestPath = cornerPath }
    frames.push({ pythonLine: PL('best = max(best'), phase: 'corner', activeLine: CL('best = Math.max(best, Math.min'), corner: [i, j], arms: { horizontal: horizontal.length, vertical: vertical.length }, path: cornerPath, best, message: `Corner at row ${i}, column ${j}: the best arms give ${cornerBest} trailing zero${cornerBest === 1 ? '' : 's'}.` })
  }
  frames.push({ pythonLine: PL('return best'), phase: 'done', activeLine: CL('return best'), corner: null, arms: null, path: bestPath, best, message: `The largest number of trailing zeros is ${best}.` })
  return { input: { grid }, result: best, frames }
}

export const code = `function countFactor(x, p) {
  let c = 0;
  while (x % p === 0) {
    x /= p;
    c++;
  }
  return c;
}

function maxTrailingZeros(grid) {
  const m = grid.length;
  const n = grid[0].length;
  const two = grid.map(row => row.map(x => countFactor(x, 2)));
  const five = grid.map(row => row.map(x => countFactor(x, 5)));
  let best = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let left2 = 0, left5 = 0, right2 = 0, right5 = 0;
      let up2 = 0, up5 = 0, down2 = 0, down5 = 0;
      for (let k = 0; k < j; k++) { left2 += two[i][k]; left5 += five[i][k]; }
      for (let k = j + 1; k < n; k++) { right2 += two[i][k]; right5 += five[i][k]; }
      for (let k = 0; k < i; k++) { up2 += two[k][j]; up5 += five[k][j]; }
      for (let k = i + 1; k < m; k++) { down2 += two[k][j]; down5 += five[k][j]; }
      const horizontal = [[0, 0], [left2, left5], [right2, right5]];
      const vertical = [[0, 0], [up2, up5], [down2, down5]];
      for (const [h2, h5] of horizontal) {
        for (const [v2, v5] of vertical) {
          best = Math.max(best, Math.min(two[i][j] + h2 + v2, five[i][j] + h5 + v5));
        }
      }
    }
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def max_trailing_zeros(grid):
    m = len(grid)
    n = len(grid[0])
    two = [[count_factor(x, 2) for x in row] for row in grid]
    five = [[count_factor(x, 5) for x in row] for row in grid]
    best = 0
    for i in range(m):
        for j in range(n):
            arms_h = [(0, 0), (sum(two[i][k] for k in range(j)), sum(five[i][k] for k in range(j))),
                      (sum(two[i][k] for k in range(j + 1, n)), sum(five[i][k] for k in range(j + 1, n)))]
            arms_v = [(0, 0), (sum(two[k][j] for k in range(i)), sum(five[k][j] for k in range(i))),
                      (sum(two[k][j] for k in range(i + 1, m)), sum(five[k][j] for k in range(i + 1, m)))]
            for h2, h5 in arms_h:
                for v2, v5 in arms_v:
                    best = max(best, min(two[i][j] + h2 + v2, five[i][j] + h5 + v5))
    return best


def count_factor(x, p):
    c = 0
    while x % p == 0:
        x //= p
        c += 1
    return c
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
