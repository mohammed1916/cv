export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8 || grid.some(row => !Array.isArray(row) || row.length !== grid.length || row.some(v => ![-1, 0, 1].includes(v)))) {
    throw new Error('Enter a square grid of up to 8 by 8 values: 1 cherry, 0 empty, -1 thorn.')
  }
  return grid
}

const JS_LINES = [
  'function cherryPickup(grid) {',
  '  const n = grid.length',
  '  if (grid[0][0] === -1 || grid[n - 1][n - 1] === -1) return 0 // the corners must be passable',
  '  // Two walkers move together: after k steps, walker one is at (r1, k - r1) and walker two at (r2, k - r2).',
  '  let dp = Array.from({ length: n }, () => Array(n).fill(-Infinity))',
  '  dp[0][0] = grid[0][0] // both walkers start at (0, 0)',
  '  for (let k = 1; k <= 2 * (n - 1); k++) {',
  '    const next = Array.from({ length: n }, () => Array(n).fill(-Infinity))',
  '    for (let r1 = Math.max(0, k - n + 1); r1 <= Math.min(n - 1, k); r1++) {',
  '      for (let r2 = r1; r2 <= Math.min(n - 1, k); r2++) {',
  '        const c1 = k - r1, c2 = k - r2',
  '        if (grid[r1][c1] === -1 || grid[r2][c2] === -1) continue // a thorn blocks this state',
  '        let best = -Infinity',
  '        for (const d1 of [0, 1]) for (const d2 of [0, 1]) { // each walker came from above or from the left',
  '          const a = Math.min(r1 - d1, r2 - d2), b = Math.max(r1 - d1, r2 - d2)',
  '          if (a >= 0) best = Math.max(best, dp[a][b])',
  '        }',
  '        if (best === -Infinity) continue',
  '        next[r1][r2] = best + grid[r1][c1] + (r1 === r2 ? 0 : grid[r2][c2]) // a shared cell counts once',
  '      }',
  '    }',
  '    dp = next',
  '  }',
  '  return Math.max(0, dp[n - 1][n - 1]) // unreachable means no cherries are collected',
  '}',
]
const PY_LINES = [
  'def cherry_pickup(grid):',
  '    n = len(grid)',
  '    if grid[0][0] == -1 or grid[n - 1][n - 1] == -1:',
  '        return 0',
  '    NEG = float(\'-inf\')',
  '    dp = [[NEG] * n for _ in range(n)]',
  '    dp[0][0] = grid[0][0]',
  '    for k in range(1, 2 * (n - 1) + 1):',
  '        nxt = [[NEG] * n for _ in range(n)]',
  '        for r1 in range(max(0, k - n + 1), min(n - 1, k) + 1):',
  '            for r2 in range(r1, min(n - 1, k) + 1):',
  '                c1, c2 = k - r1, k - r2',
  '                if grid[r1][c1] == -1 or grid[r2][c2] == -1:',
  '                    continue',
  '                best = NEG',
  '                for d1 in (0, 1):',
  '                    for d2 in (0, 1):',
  '                        a, b = sorted((r1 - d1, r2 - d2))',
  '                        if a >= 0:',
  '                            best = max(best, dp[a][b])',
  '                if best == NEG:',
  '                    continue',
  '                nxt[r1][r2] = best + grid[r1][c1] + (0 if r1 == r2 else grid[r2][c2])',
  '        dp = nxt',
  '    return max(0, dp[n - 1][n - 1])',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Two walkers go from (0,0) to (n-1,n-1) on right and down moves; the round trip is one walker out and one back.
// The state after k steps is the pair of rows (r1, r2). The answer is the best total that reaches the corner.
export function buildTrace(grid) {
  const n = grid.length
  const NEG = -Infinity
  let dp = Array.from({ length: n }, () => Array(n).fill(NEG))
  const frames = []
  if (grid[0][0] === -1 || grid[n - 1][n - 1] === -1) {
    frames.push({ phase: 'done', k: 0, walkers: [], dp: dp.map(r => r.map(String)), result: 0, activeLine: L('return 0 //'), pythonLine: P('return 0'), message: 'A corner is a thorn, so no round trip exists and the answer is 0.' })
    return { input: grid, result: 0, frames }
  }
  dp[0][0] = grid[0][0]
  frames.push({ phase: 'start', k: 0, walkers: [[0, 0], [0, 0]], dp: dp.map(r => r.map(v => (v === NEG ? '–' : String(v)))), activeLine: L('dp[0][0] = grid[0][0]'), pythonLine: P('dp[0][0] = grid[0][0]'), message: 'Both walkers start at the top-left corner with its cherry collected once.' })
  for (let k = 1; k <= 2 * (n - 1); k++) {
    const next = Array.from({ length: n }, () => Array(n).fill(NEG))
    for (let r1 = Math.max(0, k - n + 1); r1 <= Math.min(n - 1, k); r1++) {
      for (let r2 = r1; r2 <= Math.min(n - 1, k); r2++) {
        const c1 = k - r1, c2 = k - r2
        if (grid[r1][c1] === -1 || grid[r2][c2] === -1) continue
        let best = NEG
        for (const d1 of [0, 1]) for (const d2 of [0, 1]) {
          const a = Math.min(r1 - d1, r2 - d2), b = Math.max(r1 - d1, r2 - d2)
          if (a >= 0) best = Math.max(best, dp[a][b])
        }
        if (best === NEG) continue
        next[r1][r2] = best + grid[r1][c1] + (r1 === r2 ? 0 : grid[r2][c2])
      }
    }
    dp = next
    const reached = dp[n - 1][n - 1]
    frames.push({ phase: 'step', k, walkers: [[Math.min(k, n - 1), k - Math.min(k, n - 1)], [Math.max(0, k - n + 1), Math.min(n - 1, k)]], dp: dp.map(r => r.map(v => (v === NEG ? '–' : String(v)))),
      activeLine: L('next[r1][r2] = best'), pythonLine: P('nxt[r1][r2] ='),
      message: `After ${k} step${k === 1 ? '' : 's'} each, the walkers' best totals are stored for every pair of rows (r1, r2).${reached === NEG ? '' : ` The corner is reachable with total ${reached}.`}` })
  }
  const final = dp[n - 1][n - 1]
  const result = final === NEG ? 0 : Math.max(0, final)
  frames.push({ phase: 'done', k: 2 * (n - 1), walkers: [[n - 1, n - 1], [n - 1, n - 1]], dp: dp.map(r => r.map(v => (v === NEG ? '–' : String(v)))), result, activeLine: L('return Math.max(0'), pythonLine: P('return max(0'), message: `Best round trip collects ${result} cherr${result === 1 ? 'y' : 'ies'}.` })
  return { input: grid, result, frames }
}
