import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every extra amount (0 to 6) for every position, then keep the most special indices with the fewest raises.
function oracle(nums) {
  const n = nums.length
  let bestCount = -1
  let bestCost = Infinity
  const total = 7 ** n
  for (let code = 0; code < total; code++) {
    const extra = []
    let c = code
    let cost = 0
    for (let i = 0; i < n; i++) { extra.push(c % 7); cost += c % 7; c = Math.floor(c / 7) }
    const a = nums.map((v, i) => v + extra[i])
    let count = 0
    for (let i = 1; i < n - 1; i++) if (a[i] > a[i - 1] && a[i] > a[i + 1]) count++
    if (count > bestCount || (count === bestCount && cost < bestCost)) { bestCount = count; bestCost = cost }
  }
  return bestCost
}

test('3891 worked examples', () => {
  assert.equal(buildTrace(parseInput('{"nums":[1,2,2]}')).result, 1)
  assert.equal(buildTrace(parseInput('{"nums":[2,1,1,3]}')).result, 2)
})

test('3891 matches the exhaustive oracle on small arrays', () => {
  for (let trial = 0; trial < 150; trial++) {
    const nums = Array.from({ length: 3 + (trial % 3) }, () => Math.floor(Math.random() * 4))
    assert.equal(buildTrace({ nums }).result, oracle(nums), JSON.stringify(nums))
  }
})
