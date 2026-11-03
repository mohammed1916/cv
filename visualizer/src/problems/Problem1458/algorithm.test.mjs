import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

test('1458 sample inputs return the expected best products', () => {
  assert.equal(solve([3, -1, 4], [2, 6, -5]), 30)
  assert.equal(solve([-1, -2], [1, 2]), -1)
  assert.equal(solve([5], [-3]), -15)
})

test('1458 a nonempty answer is required even when every product is negative', () => {
  assert.equal(solve([-4, -9], [-2, -1]), 18)
  assert.equal(solve([-1], [-1, -1]), 1)
  assert.equal(solve([-3, -5, -7], [-2]), 14)
})

test('1458 frames show table borders and finish at the full cell', () => {
  const { frames, result } = buildTrace({ nums1: [1, 2], nums2: [3] })
  assert.equal(result, 6)
  assert.equal(frames[0].snapshot.table[0][0], null)
  assert.equal(frames.at(-1).phase, 'done')
})

test('1458 rejects malformed input', () => {
  assert.throws(() => parseInput('[1]'), /object/)
  assert.throws(() => parseInput('{"nums1":[],"nums2":[1]}'), /nums1/)
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[11]}'), /nums2/)
})

// Independent oracle: enumerate every nonempty subsequence pair of equal length.
function brute(a, b) {
  let best = -Infinity
  for (let ma = 1; ma < 1 << a.length; ma++) {
    for (let mb = 1; mb < 1 << b.length; mb++) {
      const ia = a.filter((_, i) => ma & (1 << i))
      const ib = b.filter((_, i) => mb & (1 << i))
      if (ia.length !== ib.length) continue
      best = Math.max(best, ia.reduce((s, v, i) => s + v * ib[i], 0))
    }
  }
  return best
}

test('1458 random small lists match exhaustive enumeration', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const a = Array.from({ length: 1 + rnd(5) }, () => rnd(21) - 10)
    const b = Array.from({ length: 1 + rnd(5) }, () => rnd(21) - 10)
    assert.equal(solve(a, b), brute(a, b), `${JSON.stringify(a)} ${JSON.stringify(b)}`)
  }
})
