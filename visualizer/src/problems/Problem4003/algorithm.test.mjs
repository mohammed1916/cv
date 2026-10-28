import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (m, n, penalty) => buildTrace({ m, n, penalty }).result

test('4003 official examples', () => {
  assert.equal(solve(2, 2, [[5, 3], [1, 4]]), 8)
  assert.equal(solve(2, 2, [[0, 7], [3, 2]]), 7)
  assert.equal(solve(2, 3, [[8, 0, 9], [7, 4, 1]]), 12)
})

test('4003 a single row must alternate moves that go the wrong way', () => {
  // With one row, the only compliant moves are right; each wrong-way move pays the penalty of the cell left.
  assert.equal(solve(1, 3, [[0, 0, 0]]), 1 + 2 + 3)
})

test('4003 rejects a grid that is too large for the visualization', () => {
  assert.throws(() => parseInput('{"m":5,"n":5,"penalty":[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]}'))
})

// Independent oracle: Bellman-Ford style relaxation over the same state model, repeated until nothing changes.
function oracle(m, n, penalty) {
  const entry = (i, j) => (i + 1) * (j + 1)
  const d = new Map([['0,0,0', entry(0, 0)]])
  const get = (i, j, p) => d.get(`${i},${j},${p}`) ?? Infinity
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        for (let p = 0; p < 2; p++) {
          const cur = get(i, j, p)
          if (cur === Infinity) continue
          const relax = (ni, nj, extra) => {
            const k = `${ni},${nj},${1 - p}`
            if (cur + extra < (d.get(k) ?? Infinity)) { d.set(k, cur + extra); changed = true }
          }
          relax(i, j, penalty[i][j])
          for (const [di, dj] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
            const ni = i + di
            const nj = j + dj
            if (ni < 0 || nj < 0 || ni >= m || nj >= n) continue
            const ok = p === 0 ? di === 1 || dj === 1 : di === -1 || dj === -1
            relax(ni, nj, entry(ni, nj) + (ok ? 0 : penalty[i][j]))
          }
        }
      }
    }
  }
  return Math.min(get(m - 1, n - 1, 0), get(m - 1, n - 1, 1))
}

test('4003 random grids match a relaxation oracle', () => {
  let seed = 4003
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(3)
    const n = 1 + rnd(4)
    if (m * n < 2) continue
    const penalty = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(10)))
    assert.equal(solve(m, n, penalty), oracle(m, n, penalty), JSON.stringify({ m, n, penalty }))
  }
})
