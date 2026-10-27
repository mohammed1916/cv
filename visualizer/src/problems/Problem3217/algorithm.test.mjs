import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, head) => buildTrace(parseInput(JSON.stringify({ nums, head }))).result

test('3217 official examples', () => {
  assert.deepEqual(solve([1, 2, 3], [1, 2, 3, 4, 5]), [4, 5])
  assert.deepEqual(solve([1], [1, 2, 1, 2, 1, 2]), [2, 2, 2])
  assert.deepEqual(solve([5], [1, 2, 3, 4]), [1, 2, 3, 4])
})

test('3217 every node can be removed', () => {
  assert.deepEqual(solve([1, 2], [2, 1]), [])
})

test('3217 rejects values outside 1 to 10', () => {
  assert.throws(() => parseInput('{"nums":[0],"head":[1]}'))
})

// Independent oracle: for each node, scan the forbidden array linearly instead of using a set.
function oracle(nums, head) {
  return head.filter(v => !nums.some(x => x === v))
}

test('3217 random inputs match a linear-scan oracle', () => {
  let seed = 3217
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(8))
    const head = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(8))
    assert.deepEqual(solve(nums, head), oracle(nums, head), JSON.stringify({ nums, head }))
  }
})
