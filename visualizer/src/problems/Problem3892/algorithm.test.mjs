import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every extra amount (0 to 4) per position and count circular strict peaks.
function oracle(nums, k) {
  const n = nums.length
  let best = null
  const total = 5 ** n
  for (let code = 0; code < total; code++) {
    let c = code
    const extra = []
    for (let i = 0; i < n; i++) { extra.push(c % 5); c = Math.floor(c / 5) }
    const a = nums.map((v, i) => v + extra[i])
    let peaks = 0
    for (let i = 0; i < n; i++) if (a[i] > a[(i - 1 + n) % n] && a[i] > a[(i + 1) % n]) peaks++
    const cost = extra.reduce((s, e) => s + e, 0)
    if (peaks >= k && (best === null || cost < best)) best = cost
  }
  return best === null ? -1 : best
}

test('3892 worked examples', () => {
  assert.equal(buildTrace(parseInput('{"nums":[3,1,3],"k":1}')).result, 1)
  assert.equal(buildTrace(parseInput('{"nums":[1,5,2,6,3],"k":2}')).result, 0)
})

test('3892 too many peaks is impossible', () => {
  assert.equal(buildTrace(parseInput('{"nums":[1,2,3,4,5],"k":3}')).result, -1)
})

test('3892 matches the exhaustive oracle on small circles', () => {
  for (let trial = 0; trial < 60; trial++) {
    const nums = Array.from({ length: 3 + (trial % 3) }, () => 1 + Math.floor(Math.random() * 3))
    const k = trial % (nums.length + 1)
    assert.equal(buildTrace({ nums, k }).result, oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
