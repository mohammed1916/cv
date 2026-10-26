import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = g => buildTrace(parseInput(JSON.stringify(g))).result
// Oracle: BFS labelling; walls = count of (infected, healthy) neighbour pairs per region.
function oracle(input) {
  const g = input.map(r => [...r]), m = g.length, n = g[0].length
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  let walls = 0
  for (;;) {
    const label = g.map(r => r.map(() => -1)); const regs = []
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (g[r][c] === 1 && label[r][c] < 0) {
      const id = regs.length, q = [[r, c]]; label[r][c] = id
      const cells = []
      for (let h = 0; h < q.length; h++) { const [x, y] = q[h]; cells.push([x, y]); for (const [dx, dy] of dirs) { const a = x + dx, b = y + dy; if (a >= 0 && a < m && b >= 0 && b < n && g[a][b] === 1 && label[a][b] < 0) { label[a][b] = id; q.push([a, b]) } } }
      regs.push(cells)
    }
    const info = regs.map(cells => { let pairs = 0; const set = new Set(); for (const [x, y] of cells) for (const [dx, dy] of dirs) { const a = x + dx, b = y + dy; if (a >= 0 && a < m && b >= 0 && b < n && g[a][b] === 0) { pairs++; set.add(a + ',' + b) } } return { cells, pairs, set } })
    if (!info.length) return walls
    let best = 0; info.forEach((x, i) => { if (x.set.size > info[best].set.size) best = i })
    if (!info[best].set.size) return walls
    walls += info[best].pairs
    for (const [x, y] of info[best].cells) g[x][y] = 2
    info.forEach((x, i) => { if (i !== best) for (const k of x.set) { const [a, b] = k.split(',').map(Number); g[a][b] = 1 } })
  }
}
test('official examples', () => {
  assert.equal(solve([[0, 1, 0, 0, 0, 0, 0, 1], [0, 1, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0]]), 10)
  assert.equal(solve([[1, 1, 1], [1, 0, 1], [1, 1, 1]]), 4)
  assert.equal(solve([[1, 1, 1, 0, 0, 0, 0, 0, 0], [1, 0, 1, 0, 1, 1, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0, 0, 0]]), 13)
})
test('random grids vs BFS oracle', () => {
  let seed = 31
  const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n
  for (let t = 0; t < 400; t++) {
    const m = 1 + rnd(8), n = 1 + rnd(8), p = 1 + rnd(4)
    const g = Array.from({ length: m }, () => Array.from({ length: n }, () => (rnd(8) < p ? 1 : 0)))
    assert.equal(solve(g), oracle(g), JSON.stringify(g))
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('[[0,2]]'), /0 and 1/)
  assert.throws(() => parseInput('[[0,1],[1]]'), /rectangular/)
  assert.throws(() => parseInput('[]'), /rows/)
})
