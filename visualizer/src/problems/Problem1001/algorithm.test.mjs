import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, lamps, queries) => buildTrace({ n, lamps, queries }).result

test('1001 official examples', () => {
  assert.deepEqual(solve(5, [[0, 0], [4, 4]], [[1, 1], [1, 0]]), [1, 0])
  assert.deepEqual(solve(5, [[0, 0], [4, 4]], [[1, 1], [1, 1]]), [1, 1])
})

test('1001 a single cell lamp goes off after it is queried', () => {
  assert.deepEqual(solve(1, [[0, 0]], [[0, 0], [0, 0]]), [1, 0])
  assert.deepEqual(solve(1, [], [[0, 0]]), [0])
})

test('1001 rejects an out-of-grid cell and a duplicate lamp', () => {
  assert.throws(() => parseInput('{"n":3,"lamps":[[3,0]],"queries":[[0,0]]}'), /lamps/)
  assert.throws(() => parseInput('{"n":3,"lamps":[[1,1],[1,1]],"queries":[[0,0]]}'), /distinct/)
  assert.throws(() => parseInput('{"n":9,"lamps":[],"queries":[[0,0]]}'), /n must be/)
})

// Independent oracle: scan the whole lamp list for every query, and rebuild the lamp list with a plain array.
function oracle(lamps, queries) {
  let on = lamps.map(([r, c]) => [r, c])
  return queries.map(([r, c]) => {
    const lit = on.some(([lr, lc]) => lr === r || lc === c || lr - lc === r - c || lr + lc === r + c)
    on = on.filter(([lr, lc]) => Math.abs(lr - r) > 1 || Math.abs(lc - c) > 1)
    return lit ? 1 : 0
  })
}

test('1001 random grids match a brute-force oracle', () => {
  let seed = 1001
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const cells = []
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push([r, c])
    for (let i = cells.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[cells[i], cells[j]] = [cells[j], cells[i]]
    }
    const lamps = cells.slice(0, rnd(Math.min(10, n * n) + 1))
    const queries = Array.from({ length: 1 + rnd(10) }, () => [rnd(n), rnd(n)])
    const input = JSON.stringify({ n, lamps, queries })
    parseInput(input)
    assert.deepEqual(solve(n, lamps, queries), oracle(lamps, queries), input)
  }
})
