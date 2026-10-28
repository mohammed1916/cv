import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target) => buildTrace(parseInput(JSON.stringify({ nums, target }))).result

test('3566 official examples', () => {
  assert.equal(solve([3, 1, 6, 8, 4], 24), true)
  assert.equal(solve([2, 5, 3, 7], 15), false)
})

test('3566 a single element can form one whole group', () => {
  // {6} multiplies to 6 and {2, 3} multiplies to 6, so the split works.
  assert.equal(solve([2, 3, 6], 6), true)
  assert.equal(solve([2, 3, 5], 6), false)
})

test('3566 rejects repeated elements', () => {
  assert.throws(() => parseInput('{"nums":[2,2,3],"target":6}'))
})

// Independent oracle: assign every element to group A or group B by recursion, tracking both products and sizes.
function oracle(nums, target) {
  const rec = (i, pa, pb, na, nb) => {
    if (i === nums.length) return na > 0 && nb > 0 && pa === target && pb === target
    return rec(i + 1, pa * nums[i], pb, na + 1, nb) || rec(i + 1, pa, pb * nums[i], na, nb + 1)
  }
  return rec(0, 1, 1, 0, 0)
}

test('3566 random arrays match a two-group recursion oracle', () => {
  let seed = 3566
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 200; trial++) {
    const size = 3 + rnd(4)
    const pool = Array.from({ length: 12 }, (_, i) => i + 1)
    const nums = []
    while (nums.length < size) nums.push(pool.splice(rnd(pool.length), 1)[0])
    const target = [1, 2, 3, 4, 6, 8, 12, 24][rnd(8)]
    assert.equal(solve(nums, target), oracle(nums, target), JSON.stringify({ nums, target }))
  }
})
