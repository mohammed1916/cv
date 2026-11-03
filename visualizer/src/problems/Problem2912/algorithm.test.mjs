import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const MOD = 1000000007
const pyLines = python.trim().split('\n').length
const solve = (n, m, k, source, destination) => buildTrace({ n, m, k, source, destination }).result

test('2912 worked examples', () => {
  assert.equal(solve(3, 4, 3, [1, 1], [2, 3]), 9)
  assert.equal(solve(2, 2, 2, [1, 2], [1, 2]), 2)
  assert.equal(solve(1, 1, 0, [1, 1], [1, 1]), 1)
  assert.equal(solve(1, 5, 1, [1, 1], [1, 4]), 1)
  assert.equal(solve(2, 2, 1, [1, 1], [2, 2]), 0)
})

test('2912 parser rejects bad sizes and off-grid cells', () => {
  assert.throws(() => parseInput('{"n":0,"m":2,"k":1,"source":[1,1],"destination":[1,2]}'))
  assert.throws(() => parseInput('{"n":2,"m":2,"k":13,"source":[1,1],"destination":[1,2]}'))
  assert.throws(() => parseInput('{"n":2,"m":2,"k":1,"source":[3,1],"destination":[1,2]}'))
})

// Brute oracle: track the number of ways to stand on every cell after each move.
function oracle(n, m, k, source, destination) {
  let ways = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  ways[source[0]][source[1]] = 1
  for (let t = 0; t < k; t++) {
    const next = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
    for (let r1 = 1; r1 <= n; r1++) for (let c1 = 1; c1 <= m; c1++) {
      if (!ways[r1][c1]) continue
      for (let r2 = 1; r2 <= n; r2++) for (let c2 = 1; c2 <= m; c2++) {
        if ((r1 === r2) !== (c1 === c2)) next[r2][c2] = (next[r2][c2] + ways[r1][c1]) % MOD
      }
    }
    ways = next
  }
  return ways[destination[0]][destination[1]]
}

test('2912 random small grids match the cell-by-cell oracle', () => {
  let seed = 2912
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const m = 1 + rnd(5)
    const k = rnd(7)
    const source = [1 + rnd(n), 1 + rnd(m)]
    const destination = [1 + rnd(n), 1 + rnd(m)]
    assert.equal(solve(n, m, k, source, destination), oracle(n, m, k, source, destination), JSON.stringify({ n, m, k, source, destination }))
  }
})

test('2912 frames keep valid lines and one frame per move', () => {
  const run = buildTrace({ n: 3, m: 4, k: 3, source: [1, 1], destination: [2, 3] })
  assert.equal(run.frames.length, 3 + 2)
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
  }
})
