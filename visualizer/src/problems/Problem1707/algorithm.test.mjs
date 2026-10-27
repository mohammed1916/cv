import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1707 official examples', () => {
  assert.deepEqual(solve({ nums: [0, 1, 2, 3, 4], queries: [[3, 1], [1, 3], [5, 6]] }), [3, 3, 7])
  assert.deepEqual(solve({ nums: [5, 2, 4, 6, 6, 3], queries: [[12, 4], [8, 1], [6, 3]] }), [15, -1, 5])
})

test('1707 a query below every element returns -1', () => {
  assert.deepEqual(solve({ nums: [7], queries: [[1, 6], [1, 7]] }), [-1, 6])
})

test('1707 rejects a query with the wrong shape', () => {
  assert.throws(() => parseInput('{"nums":[1],"queries":[[1]]}'))
})

// Independent oracle: for each query scan every element that is at most m.
function oracle({ nums, queries }) {
  return queries.map(([x, m]) => {
    let best = -1
    for (const v of nums) if (v <= m && (best === -1 || (x ^ v) > best)) best = x ^ v
    return best
  })
}

test('1707 random inputs match a linear-scan oracle', () => {
  let seed = 1707
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(31))
    const queries = Array.from({ length: 1 + rnd(6) }, () => [rnd(31), rnd(31)])
    const input = { nums, queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
