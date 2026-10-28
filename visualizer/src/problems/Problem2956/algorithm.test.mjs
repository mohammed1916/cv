import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2956 official examples', () => {
  assert.deepEqual(solve('{"nums1":[4,3,2,3,1],"nums2":[2,2,5,2,3,6]}'), [3, 4])
  assert.deepEqual(solve('{"nums1":[3,4,2,3],"nums2":[1,5]}'), [0, 0])
})

test('2956 repeated entries are counted at every index', () => {
  assert.deepEqual(solve('{"nums1":[7,7,7],"nums2":[7]}'), [3, 1])
})

test('2956 rejects a value outside 1 to 50', () => {
  assert.throws(() => parseInput('{"nums1":[0],"nums2":[1]}'))
})

// Independent oracle: for each index, scan the other array with a nested loop.
function oracle(nums1, nums2) {
  const first = nums1.filter(v => nums2.some(w => w === v)).length
  const second = nums2.filter(v => nums1.some(w => w === v)).length
  return [first, second]
}

test('2956 random arrays match a nested-loop oracle', () => {
  let seed = 2956
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 300; round++) {
    const nums1 = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(9))
    const nums2 = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(9))
    assert.deepEqual(solve(JSON.stringify({ nums1, nums2 })), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
