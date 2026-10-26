import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result
function brute(nums, k) {
  let best = Infinity
  for (let m = 0; m < 1 << nums.length; m++) {
    const v = nums.map((x, i) => x + ((m >> i) & 1 ? k : -k))
    best = Math.min(best, Math.max(...v) - Math.min(...v))
  }
  return best
}
test('official examples', () => {
  assert.equal(solve([1], 0), 0)
  assert.equal(solve([0, 10], 2), 6)
  assert.equal(solve([1, 3, 6], 3), 3)
})
test('matches 2^n brute force', () => {
  let seed = 5
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(9)
    const nums = Array.from({ length: n }, () => rnd(40))
    const k = rnd(25)
    assert.equal(solve(nums, k), brute(nums, k), JSON.stringify({ nums, k }))
  }
})
test('ends done, rejects bad input', () => {
  assert.equal(buildTrace(parseInput('{"nums":[1,2],"k":1}')).frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":-1}'))
  assert.throws(() => parseInput('[1,2]'))
})
