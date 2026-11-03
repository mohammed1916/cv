import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3641 hand-checked values', () => {
  assert.equal(solve([1, 2, 1, 3, 3, 3, 2], 1), 5)
  assert.equal(solve([1, 2, 3, 1], 0), 3)
  assert.equal(solve([4], 0), 1)
  assert.equal(solve([2, 2, 2, 2], 1), 4)
})

test('3641 a value repeated many times counts once', () => {
  assert.equal(solve([7, 7, 7, 7, 7], 1), 5)
  assert.equal(solve([7, 7, 7, 7, 7], 0), 1)
})

test('3641 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":0}'))
  assert.throws(() => parseInput('{"nums":[10],"k":0}'))
  assert.throws(() => parseInput('{"nums":[1],"k":6}'))
})

test('3641 frames carry valid lines and phases', () => {
  const trace = buildTrace({ nums: [1, 2, 1, 3], k: 0 })
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of trace.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(phaseIds.has(frame.phase))
    assert.ok(frame.repeated <= Math.max(frame.k, 1) || frame.phase === 'repeat' || frame.phase === 'extend')
  }
})

// Oracle: test every subarray directly and count distinct values that occur twice or more.
test('3641 matches a direct oracle on random inputs', () => {
  let seed = 3641
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(5))
    const k = rnd(4)
    let expected = 0
    for (let a = 0; a < nums.length; a++) {
      for (let b = a; b < nums.length; b++) {
        const seen = new Map()
        for (let x = a; x <= b; x++) seen.set(nums[x], (seen.get(nums[x]) || 0) + 1)
        const repeatedTypes = [...seen.values()].filter(c => c >= 2).length
        if (repeatedTypes <= k) expected = Math.max(expected, b - a + 1)
      }
    }
    assert.equal(solve(nums, k), expected, JSON.stringify({ nums, k }))
  }
})
