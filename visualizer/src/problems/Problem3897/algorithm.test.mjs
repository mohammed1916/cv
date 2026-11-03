import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every ordering of the segments and keep the largest concatenated value.
function oracle(nums1, nums0) {
  const n = nums1.length
  const segs = nums1.map((o, i) => ({ o, z: nums0[i] }))
  const perms = arr => arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]))
  let best = -1n
  for (const order of perms([...Array(n).keys()])) {
    let total = 0n
    for (const i of order) {
      const { o, z } = segs[i]
      const bits = '1'.repeat(o) + '0'.repeat(z)
      total = (total << BigInt(bits.length)) + BigInt('0b' + bits)
    }
    if (total > best) best = total
  }
  return Number(best % 1000000007n)
}

test('3897 worked example', () => {
  assert.equal(buildTrace(parseInput('{"nums1":[2,0,1],"nums0":[1,3,0]}')).result, 112)
})

test('3897 matches a brute force over all orderings on small inputs', () => {
  for (let trial = 0; trial < 150; trial++) {
    const n = 1 + (trial % 5)
    const nums1 = Array.from({ length: n }, () => Math.floor(Math.random() * 4))
    const nums0 = Array.from({ length: n }, () => Math.floor(Math.random() * 4))
    nums0.forEach((z, i) => { if (nums1[i] + z === 0) nums1[i] = 1 })
    assert.equal(buildTrace({ nums1, nums0 }).result, oracle(nums1, nums0), JSON.stringify({ nums1, nums0 }))
  }
})
