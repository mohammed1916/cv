import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, paths) => buildTrace({ n, paths }).result

test('1042 official examples', () => {
  assert.deepEqual(solve(3, [[1, 2], [2, 3], [3, 1]]), [1, 2, 3])
  assert.deepEqual(solve(4, [[1, 2], [3, 4]]), [1, 2, 1, 2])
})

test('1042 edge case: a garden with no paths gets the first flower type', () => {
  assert.deepEqual(solve(1, []), [1])
  assert.deepEqual(solve(2, []), [1, 1])
})

test('1042 rejects self paths and gardens with more than three paths', () => {
  assert.throws(() => parseInput('{"n":2,"paths":[[1,1]]}'))
  assert.throws(() => parseInput('{"n":5,"paths":[[1,2],[1,3],[1,4],[1,5]]}'))
})

// Independent check: a colouring is valid when every type is 1 to 4 and no linked pair shares a type.
function isValidColouring(n, paths, flowers) {
  if (flowers.length !== n) return false
  if (!flowers.every(f => Number.isInteger(f) && f >= 1 && f <= 4)) return false
  return paths.every(([a, b]) => flowers[a - 1] !== flowers[b - 1])
}

test('1042 random graphs produce valid colourings', () => {
  let seed = 1042
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const degree = Array(n + 1).fill(0)
    const paths = []
    for (let k = 0; k < 12; k++) {
      const a = 1 + rnd(n)
      const b = 1 + rnd(n)
      if (a === b || degree[a] >= 3 || degree[b] >= 3) continue
      degree[a]++
      degree[b]++
      paths.push([a, b])
    }
    const flowers = solve(n, paths)
    assert.ok(isValidColouring(n, paths, flowers), JSON.stringify({ n, paths, flowers }))
  }
})
