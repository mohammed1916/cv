export function parseInput(text) {
  const g = JSON.parse(text)
  if (!Array.isArray(g) || g.length < 1 || g.length > 10 || !g.every(r => Array.isArray(r) && r.length === g[0].length && r.length >= 1 && r.length <= 10 && r.every(v => Number.isInteger(v) && v >= 0 && v <= 15))) {
    throw new Error('Enter a rectangular JSON grid of 1-10 rows and 1-10 columns with integers 0-15 (visualization cap: 10x10).')
  }
  return g
}
export function buildTrace(grid) {
  const R = grid.length, C = grid[0].length
  const frames = [{ phase: 'start', activeLine: 2, r: -1, c: -1, count: 0, found: [], message: `Grid is ${R}x${C}. Every 3x3 window with top-left (r, c) where r is at most ${R - 3} and c is at most ${C - 3} is a candidate.` }]
  let count = 0
  const found = []
  for (let r = 0; r + 2 < R; r++) for (let c = 0; c + 2 < C; c++) {
    const cells = []
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cells.push(grid[r + i][c + j])
    const snap = (phase, line, message, ok) => frames.push({ phase, activeLine: line, r, c, count, found: [...found], ok, cells, message })
    snap('window', 5, `Examine the window with top-left (${r}, ${c}).`)
    if (grid[r + 1][c + 1] !== 5) {
      snap('reject', 6, `Centre is ${grid[r + 1][c + 1]}, not 5. In any 1-9 magic square the centre must be 5 (it lies on 4 lines summing to 15), so reject.`, false)
      continue
    }
    const sorted = [...cells].sort((a, b) => a - b)
    if (sorted.some((v, i) => v !== i + 1)) {
      snap('reject', 8, `Cells sorted are [${sorted.join(', ')}], not exactly 1..9, so reject.`, false)
      continue
    }
    const rows = [0, 1, 2].map(i => cells[i * 3] + cells[i * 3 + 1] + cells[i * 3 + 2])
    const cols = [0, 1, 2].map(j => cells[j] + cells[j + 3] + cells[j + 6])
    const diags = [cells[0] + cells[4] + cells[8], cells[2] + cells[4] + cells[6]]
    const sums = [...rows, ...cols, ...diags]
    if (sums.every(x => x === 15)) {
      count++; found.push([r, c])
      snap('accept', 13, `Rows ${rows}, columns ${cols}, diagonals ${diags}: all equal 15. Magic square number ${count}.`, true)
    } else {
      snap('reject', 12, `Sums rows ${rows}, columns ${cols}, diagonals ${diags} are not all 15, so reject.`, false)
    }
  }
  frames.push({ phase: 'done', activeLine: 14, r: -1, c: -1, count, found: [...found], message: `Found ${count} magic square${count === 1 ? '' : 's'}.` })
  return { input: grid.map(r => [...r]), result: count, frames }
}
export const code = `def numMagicSquaresInside(grid):
    R, C = len(grid), len(grid[0])
    count = 0
    for r in range(R - 2):
        for c in range(C - 2):
            if grid[r+1][c+1] != 5: continue
            cells = [grid[r+i][c+j] for i in range(3) for j in range(3)]
            if sorted(cells) != list(range(1, 10)): continue
            rows = [sum(cells[i*3:i*3+3]) for i in range(3)]
            cols = [sum(cells[j::3]) for j in range(3)]
            diags = [cells[0]+cells[4]+cells[8], cells[2]+cells[4]+cells[6]]
            if all(s == 15 for s in rows + cols + diags):
                count += 1
    return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
