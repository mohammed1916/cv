import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, buildings) => buildTrace({ n, buildings }).result

test('3531 worked examples', () => {
  assert.equal(solve(3, [[1, 2], [2, 2], [3, 2], [2, 1], [2, 3]]), 1)
  assert.equal(solve(3, [[1, 1], [1, 2], [2, 1], [2, 2]]), 0)
  assert.equal(solve(5, [[1, 3], [3, 2], [3, 3], [3, 5], [5, 3]]), 1)
})

test('3531 a lone building or a single line is never covered', () => {
  assert.equal(solve(2, [[1, 1]]), 0)
  assert.equal(solve(4, [[1, 2], [2, 2], [3, 2], [4, 2]]), 0)
})

test('3531 rejects duplicate or out-of-grid buildings', () => {
  assert.throws(() => parseInput('{"n":3,"buildings":[[1,1],[1,1]]}'))
  assert.throws(() => parseInput('{"n":3,"buildings":[[4,1]]}'))
})

// Independent oracle: for each building search all other buildings in the four directions.
function oracle(buildings) {
  let count = 0
  for (const [x, y] of buildings) {
    const left = buildings.some(([a, b]) => b === y && a < x)
    const right = buildings.some(([a, b]) => b === y && a > x)
    const below = buildings.some(([a, b]) => a === x && b < y)
    const above = buildings.some(([a, b]) => a === x && b > y)
    if (left && right && below && above) count++
  }
  return count
}

test('3531 random layouts match a pairwise oracle', () => {
  let seed = 3531
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(7)
    const cells = []
    for (let x = 1; x <= n; x++) for (let y = 1; y <= n; y++) cells.push([x, y])
    const picked = cells.filter(() => rnd(3) === 0)
    if (picked.length === 0) continue
    assert.equal(solve(n, picked), oracle(picked), JSON.stringify({ n, picked }))
  }
})
