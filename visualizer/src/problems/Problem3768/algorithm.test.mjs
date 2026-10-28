import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3768 official examples', () => {
  assert.equal(solve({ nums: [3, 1, 2, 5, 4], k: 3 }), 0)
  assert.equal(solve({ nums: [5, 3, 2, 1], k: 4 }), 6)
  assert.equal(solve({ nums: [2, 1], k: 1 }), 0)
})

test('3768 edge cases: a sorted window has no inversions, a reversed one has all pairs', () => {
  assert.equal(solve({ nums: [1, 2, 3, 4], k: 4 }), 0)
  assert.equal(solve({ nums: [4, 3, 2, 1], k: 4 }), 6)
})

test('3768 rejects k larger than the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: count inversions of every window with merge sort, a different method from pair comparison.
function mergeCount(a) {
  if (a.length < 2) return [a, 0]
  const mid = a.length >> 1
  const [left, x] = mergeCount(a.slice(0, mid))
  const [right, y] = mergeCount(a.slice(mid))
  const out = []
  let i = 0, j = 0, cross = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) out.push(left[i++])
    else { cross += left.length - i; out.push(right[j++]) }
  }
  return [out.concat(left.slice(i), right.slice(j)), x + y + cross]
}

function oracle({ nums, k }) {
  let best = Infinity
  for (let s = 0; s + k <= nums.length; s++) best = Math.min(best, mergeCount(nums.slice(s, s + k))[1])
  return best
}

test('3768 random inputs match a merge-sort oracle', () => {
  let seed = 3768
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(12) + 1
    const input = { nums: Array.from({ length: n }, () => rnd(20) + 1), k: rnd(n) + 1 }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
