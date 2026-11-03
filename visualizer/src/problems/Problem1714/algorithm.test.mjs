import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('1714 walks each stride and sums the visited values', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5, 6], [[0, 2], [1, 3], [5, 1]]), [9, 7, 6])
  assert.deepEqual(solve([7], [[0, 1]]), [7])
})

test('1714 sums a full stride of maximum values', () => {
  const nums = Array(12).fill(100)
  assert.deepEqual(solve(nums, [[0, 1]]), [1200])
})

test('1714 rejects an invalid query', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[2,1]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[0,0]]}'))
})

test('1714 frames reference real pseudocode and python lines', () => {
  const run = buildTrace({ nums: [1, 2, 3], queries: [[0, 1]] })
  const pyCount = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyCount)
    assert.equal(typeof f.message, 'string')
  }
})

// Oracle: test each index for membership in the arithmetic progression instead of walking it.
function oracle(nums, queries) {
  return queries.map(([start, step]) => {
    let total = 0
    nums.forEach((v, i) => { if (i >= start && (i - start) % step === 0) total += v })
    return total % 1000000007
  })
}

test('1714 random inputs match a membership oracle', () => {
  let seed = 1714
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(101))
    const queries = Array.from({ length: 1 + rnd(5) }, () => [rnd(nums.length), 1 + rnd(12)])
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})
