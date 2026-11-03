import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3520 worked presets', () => {
  assert.equal(solve([5, 1, 4, 2], 3), 3)
  assert.equal(solve([1, 2, 3], 1), -1)
  assert.equal(solve([9, -6, 3, 0], 4), 15)
})

test('3520 edge cases', () => {
  assert.equal(solve([2, 1], 1), 1)
  assert.equal(solve([1, 1], 1), -1)
  assert.equal(solve([3, 2, 1], 3), 2)
})

test('3520 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
  assert.throws(() => parseInput('{"nums":[10,2],"k":1}'))
})

// Oracle: scan every threshold from 1 upward and stop at the first that reaches k.
function oracle(nums, k) {
  const count = x => {
    let c = 0
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const gap = nums[i] - nums[j]
        if (gap > 0 && gap <= x) c++
      }
    }
    return c
  }
  const top = Math.max(...nums) - Math.min(...nums)
  for (let x = 1; x <= top; x++) if (count(x) >= k) return x
  return -1
}

test('3520 random inputs match a linear threshold scan', () => {
  let seed = 3520
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 2 + rnd(6) }, () => rnd(19) - 9)
    const k = 1 + rnd(12)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('3520 frames keep pseudocode and python line references inside range', () => {
  const pyLines = python.trim().split('\n').length
  for (const input of [{ nums: [5, 1, 4, 2], k: 3 }, { nums: [1, 2, 3], k: 1 }]) {
    const run = buildTrace(input)
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) {
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    }
  }
})
