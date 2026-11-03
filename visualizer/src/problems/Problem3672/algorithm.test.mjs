import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3672 hand-checked values', () => {
  assert.equal(solve([1, 2, 2, 3, 3, 3], 2), 19)
  assert.equal(solve([5], 1), 5)
  assert.equal(solve([4, 4, 4], 3), 12)
  // Windows [2, 1] and [1, 2] both tie, so each mode is 1 with weight 1.
  assert.equal(solve([2, 1, 2], 2), 2)
})

test('3672 ties go to the smaller value', () => {
  // Window [3, 1] has a tie, so the mode is 1 and contributes 1.
  assert.equal(solve([3, 1], 2), 1)
})

test('3672 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
  assert.throws(() => parseInput('{"nums":[10],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

test('3672 frames carry valid lines and phases', () => {
  const trace = buildTrace({ nums: [1, 2, 2], k: 2 })
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of trace.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(phaseIds.has(frame.phase))
  }
})

// Oracle: recompute the mode of each window by scanning every candidate value directly.
test('3672 matches a direct oracle on random inputs', () => {
  let seed = 3672
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(4))
    const k = 1 + rnd(nums.length)
    let expected = 0
    for (let s = 0; s + k <= nums.length; s++) {
      const win = nums.slice(s, s + k)
      let bestV = 0, bestC = 0
      for (let v = 1; v <= 9; v++) {
        const c = win.filter(x => x === v).length
        if (c > bestC) { bestC = c; bestV = v }
      }
      expected += bestV * bestC
    }
    assert.equal(solve(nums, k), expected, JSON.stringify({ nums, k }))
  }
})
