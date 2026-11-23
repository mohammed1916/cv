import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { onesTutorial } from './tutorial.js'
import { examples } from './presets.js'

const solve = nums => buildTrace({ nums }).result

// Reference: try flipping each zero in turn, or none, and take the longest run.
function oracle(nums) {
  let best = 0
  const options = [-1, ...nums.map((v, i) => (v === 0 ? i : -1)).filter(i => i >= 0)]
  for (const flip of options) {
    let run = 0
    for (let i = 0; i < nums.length; i++) {
      const value = i === flip ? 1 : nums[i]
      run = value === 1 ? run + 1 : 0
      best = Math.max(best, run)
    }
  }
  return best
}

test('487 worked examples from the presets', () => {
  assert.equal(JSON.stringify(parseInput(examples[0].input).nums), '[1,1,0,1,1,0,1]')
  assert.equal(solve([1, 1, 0, 1, 1, 0, 1]), 5)
  assert.equal(solve([1, 0, 1, 1, 0]), 4)
  assert.equal(solve([0, 0, 0]), 1)
  assert.equal(solve([1, 1, 1, 1]), 4)
})

test('487 random arrays match a flip-each-zero oracle', () => {
  let seed = 487
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 500; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(2))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('487 every frame has a reason', () => {
  const traced = buildTrace({ nums: [1, 0, 0, 1] })
  for (const frame of traced.frames) assert.ok(onesTutorial({ step: frame }).reason.length > 20)
})
