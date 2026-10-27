import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2536 statement example', () => {
  assert.deepEqual(solve({ n: 3, queries: [[1, 1, 2, 2], [0, 0, 1, 1]] }), [[1, 1, 0], [1, 2, 1], [0, 1, 1]])
})

test('2536 rejects a rectangle outside the grid', () => {
  assert.throws(() => parseInput('{"n":2,"queries":[[0,0,2,1]]}'))
})

// Independent oracle: increment every cell of every rectangle directly.
function oracle({ n, queries }) {
  const grid = Array.from({ length: n }, () => Array(n).fill(0))
  for (const [r1, c1, r2, c2] of queries) {
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) grid[r][c] += 1
  }
  return grid
}

test('2536 random cases match a direct-increment oracle', () => {
  let seed = 2536
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(7)
    const queries = Array.from({ length: 1 + rnd(7) }, () => {
      const r1 = rnd(n); const c1 = rnd(n)
      return [r1, c1, r1 + rnd(n - r1), c1 + rnd(n - c1)]
    })
    const input = { n, queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
