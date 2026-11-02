import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3818 worked examples', () => {
  assert.equal(solve([1, 3, 2, 4]), 2)
  assert.equal(solve([1, 2, 3]), 0)
  assert.equal(solve([5, 4, 3]), 2)
})

test('3818 edge cases', () => {
  assert.equal(solve([7]), 0)
  assert.equal(solve([2, 2]), 1)
  assert.equal(solve([-5, 1, 0]), 2)
})

test('3818 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('{"nums":[1]}'))
})

// Independent oracle: the smallest k whose suffix is strictly increasing, found by checking each k.
function oracle(nums) {
  for (let k = 0; k < nums.length; k++) {
    let ok = true
    for (let j = k; j + 1 < nums.length; j++) if (!(nums[j] < nums[j + 1])) { ok = false; break }
    if (ok) return k
  }
  return nums.length
}

test('3818 random inputs match a brute-force oracle', () => {
  let seed = 3818
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 500; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(7) - 3)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3818 trace ends on the result and every frame has a python line', () => {
  const trace = buildTrace({ nums: [4, 1, 2, 3] })
  assert.equal(trace.result, 1)
  assert.equal(trace.frames.at(-1).phase, 'done')
  assert.ok(trace.frames.every(f => Number.isInteger(f.pythonLine) && f.pythonLine >= 1))
})
