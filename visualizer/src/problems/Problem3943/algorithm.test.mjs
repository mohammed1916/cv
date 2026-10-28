import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2, queries) => buildTrace(parseInput(JSON.stringify({ nums1, nums2, queries }))).result

test('3943 official examples', () => {
  assert.deepEqual(solve([1, 2], [3, 4], [[2, 5], [1, 0, 0, 2], [2, 5]]), [2, 1])
  assert.deepEqual(solve([1, 1], [2, 2, 3], [[2, 4], [1, 0, 1, 1], [2, 4]]), [2, 6])
  assert.deepEqual(solve([2, 5, 8, 4], [1, 3, 8], [[2, 9], [1, 1, 2, 1], [2, 10]]), [1, 0])
})

test('3943 a query with no increments reads the original arrays', () => {
  assert.deepEqual(solve([1], [1, 1], [[2, 2]]), [2])
})

test('3943 rejects a range that runs past nums2', () => {
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[1],"queries":[[1,0,1,1]]}'))
})

// Independent oracle: keep the arrays as plain lists, and count pairs by checking every (j, k) directly.
function oracle(nums1, nums2, queries) {
  const b = [...nums2]
  const out = []
  for (const q of queries) {
    if (q[0] === 1) {
      for (let k = q[1]; k <= q[2]; k++) b[k] += q[3]
    } else {
      let count = 0
      for (let j = 0; j < nums1.length; j++) for (let k = 0; k < b.length; k++) if (nums1[j] + b[k] === q[1]) count++
      out.push(count)
    }
  }
  return out
}

test('3943 random inputs match a pair-by-pair oracle', () => {
  let seed = 3943
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums1 = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(9))
    const nums2 = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(9))
    const queries = Array.from({ length: 1 + rnd(8) }, () => {
      if (rnd(2)) { const x = rnd(nums2.length); return [1, x, x + rnd(nums2.length - x), 1 + rnd(9)] }
      return [2, 1 + rnd(40)]
    })
    assert.deepEqual(solve(nums1, nums2, queries), oracle(nums1, nums2, queries), JSON.stringify({ nums1, nums2, queries }))
  }
})
