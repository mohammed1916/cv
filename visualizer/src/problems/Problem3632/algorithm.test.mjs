import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3632 hand-checked values', () => {
  assert.equal(solve([1, 2, 3], 2), 3)
  assert.equal(solve([5], 0), 1)
  assert.equal(solve([1, 2], 4), 0)
  assert.equal(solve([8, 4], 12), 1)
})

test('3632 compares numbers, not popcounts', () => {
  // 1 XOR 2 = 3 has more set bits than 4, yet 3 is smaller, so it must not count for k = 4.
  assert.equal(solve([1, 2], 4), 0)
  assert.equal(solve([3], 4), 0)
  assert.equal(solve([4], 3), 1)
})

test('3632 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[16],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":32}'))
})

test('3632 frames carry valid lines and phases', () => {
  const trace = buildTrace({ nums: [1, 2, 3], k: 2 })
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of trace.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(phaseIds.has(frame.phase))
    assert.equal(frame.prefix.length, 4)
  }
})

// Oracle: enumerate every contiguous subarray directly and XOR its values.
test('3632 matches a direct subarray oracle on random inputs', () => {
  let seed = 3632
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(16))
    const k = rnd(20)
    let expected = 0
    for (let a = 0; a < nums.length; a++) {
      let x = 0
      for (let b = a; b < nums.length; b++) {
        x ^= nums[b]
        if (x >= k) expected++
      }
    }
    assert.equal(solve(nums, k), expected, JSON.stringify({ nums, k }))
  }
})
