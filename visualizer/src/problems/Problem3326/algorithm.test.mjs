import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3326 worked cases on invented data', () => {
  assert.equal(solve([12, 9]), 1)
  assert.equal(solve([7, 7, 6]), -1)
  assert.equal(solve([1, 1, 1]), 0)
})

// Oracle: each element can only take a value along its chain; a left-to-right DP finds the cheapest non-decreasing choice.
function chainOf(x) {
  const out = [[x, 0]]
  let v = x
  for (;;) {
    let d = 2
    while (d * d <= v && v % d) d++
    const p = d * d <= v ? d : v
    if (p === v) break
    v = p
    out.push([v, out.length])
  }
  return out
}
function oracle(nums) {
  let best = new Map([[-Infinity, 0]])
  for (const x of nums) {
    const next = new Map()
    for (const [val, cost] of chainOf(x)) {
      let bestBelow = Infinity
      for (const [prev, pc] of best) if (prev <= val) bestBelow = Math.min(bestBelow, pc)
      if (bestBelow !== Infinity) next.set(val, Math.min(next.get(val) ?? Infinity, bestBelow + cost))
    }
    if (next.size === 0) return -1
    best = next
  }
  return Math.min(...best.values())
}

test('3326 matches the chain oracle on small invented arrays', () => {
  const samples = [[25, 7], [8, 4, 9], [30, 6, 6], [49, 14, 7], [15, 5, 10, 2], [7, 6], [20, 16, 4, 9]]
  for (const nums of samples) assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
})

test('3326 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('[1,2]'))
})
