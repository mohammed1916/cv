import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

// Brute force: pick k indices in each list, pair them in order, keep the best total.
function brute(a, b, k) {
  let best = -Infinity
  const choose = (list, size) => {
    const out = []
    const walk = (start, acc) => {
      if (acc.length === size) { out.push(acc); return }
      for (let i = start; i < list.length; i++) walk(i + 1, [...acc, i])
    }
    walk(0, [])
    return out
  }
  for (const I of choose(a, k)) {
    for (const J of choose(b, k)) {
      let total = 0
      for (let t = 0; t < k; t++) total += a[I[t]] * b[J[t]]
      best = Math.max(best, total)
    }
  }
  return best
}

test('3836 worked cases', () => {
  assert.equal(solve({ nums1: [2, 4, 1], nums2: [3, 1, 5, 2], k: 2 }), 26)
  assert.equal(solve({ nums1: [-4, 1, -2], nums2: [2, -1, 3], k: 2 }), 7)
})

test('3836 matches a brute force on fixed lists', () => {
  const cases = [
    [[2, -1, 4, 0], [3, 1, -2, 5], 1],
    [[2, -1, 4, 0], [3, 1, -2, 5], 2],
    [[1, 5, -3, 2], [-4, 2, 6], 2],
    [[-1, -5, 3, 2, 7], [4, -2, 1, -6, 3], 3],
  ]
  for (const [a, b, k] of cases) assert.equal(solve({ nums1: a, nums2: b, k }), brute(a, b, k))
})

test('3836 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ nums1: [1, 2], nums2: [3, 4], k: 1 }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3836 rejects k above the shorter list', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[3],"k":2}'))
})
