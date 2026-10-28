import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1577 official examples', () => {
  assert.equal(solve('{"nums1":[7,4],"nums2":[5,2,8,9]}'), 1)
  assert.equal(solve('{"nums1":[1,1],"nums2":[1,1,1]}'), 9)
  assert.equal(solve('{"nums1":[7,7,8,3],"nums2":[1,2,9,7]}'), 2)
})

test('1577 a square can match a pair from either list', () => {
  // 3 squared is 9, and 1 times 9 is 9 inside nums2.
  assert.equal(solve('{"nums1":[3],"nums2":[1,9,2]}'), 1)
  assert.equal(solve('{"nums1":[2],"nums2":[1,9,2]}'), 0)
})

test('1577 rejects a value outside 1 to 100000', () => {
  assert.throws(() => parseInput('{"nums1":[0],"nums2":[1]}'))
})

// Independent oracle: try every index triple directly, with no table.
function oracle(a, b) {
  let count = 0
  for (const x of a) {
    for (let j = 0; j < b.length; j++) {
      for (let k = j + 1; k < b.length; k++) if (x * x === b[j] * b[k]) count++
    }
  }
  return count
}

test('1577 random lists match a brute-force oracle', () => {
  let seed = 1577
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const list = () => Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(12))
  for (let round = 0; round < 300; round++) {
    const nums1 = list(), nums2 = list()
    const expected = oracle(nums1, nums2) + oracle(nums2, nums1)
    assert.equal(solve(JSON.stringify({ nums1, nums2 })), expected, JSON.stringify({ nums1, nums2 }))
  }
})
