import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3371 worked examples', () => {
  // Specials 2 and 3 sum to 5, which is in the array, so 10 is the outlier.
  assert.equal(solve([2, 3, 5, 10]), 10)
  assert.equal(solve([-2, -1, -3, -6, 4]), 4)
  assert.equal(solve([1, 1, 1, 1, 1, 5, 5]), 5)
})

test('3371 rejects arrays with no possible outlier', () => {
  assert.throws(() => parseInput('{"nums":[1,2,4]}'))
  assert.throws(() => parseInput('{"nums":[1,2]}'))
})

// Independent oracle: pick the outlier index and the sum index directly, then check the others add up.
function oracle(nums) {
  let best = null
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (j === i) continue
      let others = 0
      for (let k = 0; k < nums.length; k++) if (k !== i && k !== j) others += nums[k]
      if (others === nums[j] && (best === null || nums[i] > best)) best = nums[i]
    }
  }
  return best
}

test('3371 random arrays match an index-pair oracle', () => {
  let seed = 3371
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 900 && checked < 300; t++) {
    const len = 3 + rnd(8)
    const nums = Array.from({ length: len }, () => rnd(21) - 10)
    let parsed = true
    try { parseInput(JSON.stringify({ nums })) } catch { parsed = false }
    if (!parsed) continue
    checked++
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
  assert.ok(checked >= 100)
})
