import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('675 official examples', () => {
  assert.equal(buildTrace([[1, 2, 3], [0, 0, 4], [7, 6, 5]]).result, 6)
  assert.equal(buildTrace([[1, 2, 3], [0, 0, 0], [7, 6, 5]]).result, -1)
  assert.equal(buildTrace([[2, 3, 4], [0, 0, 5], [8, 7, 6]]).result, 6)
})

// Oracle: all-pairs shortest paths by Floyd–Warshall over open cells, then sum the legs in height order.
test('675 small forests match Floyd–Warshall over the grid', () => {
  let state = 29
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 150; t++) {
    const m = 1 + rand(4), n = 1 + rand(4)
    const forest = Array.from({ length: m }, () => Array.from({ length: n }, () => (rand(4) === 0 ? 0 : rand(3) === 0 ? 1 : 2 + rand(6))))
    if (forest[0][0] === 0) forest[0][0] = 1
    const cells = []
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) cells.push([r, c])
    const id = (r, c) => r * n + c
    const N = m * n
    const D = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? 0 : Infinity)))
    for (const [r, c] of cells) {
      if (forest[r][c] === 0) continue
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && forest[nr][nc] !== 0) D[id(r, c)][id(nr, nc)] = 1
      }
    }
    for (let k = 0; k < N; k++) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) D[i][j] = Math.min(D[i][j], D[i][k] + D[k][j])
    const trees = cells.filter(([r, c]) => forest[r][c] > 1).sort((a, b) => forest[a[0]][a[1]] - forest[b[0]][b[1]])
    let pos = id(0, 0), total = 0, possible = true
    for (const [r, c] of trees) {
      if (D[pos][id(r, c)] === Infinity) { possible = false; break }
      total += D[pos][id(r, c)]
      pos = id(r, c)
    }
    assert.equal(buildTrace(forest).result, possible ? total : -1, JSON.stringify(forest))
  }
})

test('675 rejects grids with too many trees for the visualization', () => {
  const row = Array(8).fill(2)
  assert.throws(() => parseInput(JSON.stringify([row, row])))
})
