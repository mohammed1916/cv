import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, x) => buildTrace(parseInput(JSON.stringify({ nums, x }))).result
const pyLineCount = python.trim().split('\n').length

// Independent oracle: prefix sums give every subarray sum; digits are read from the decimal string.
function oracle(nums, x) {
  const prefix = [0]
  for (const v of nums) prefix.push(prefix[prefix.length - 1] + v)
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j <= nums.length; j++) {
      const sum = prefix[j] - prefix[i]
      if (sum <= 0) continue
      const s = sum.toString()
      if (s[0] === String(x) && s[s.length - 1] === String(x)) count++
    }
  }
  return count
}

test('3972 hand-checked values', () => {
  assert.equal(solve([1, 2, 3], 1), 1)
  assert.equal(solve([1, 2, 3], 3), 2)
  assert.equal(solve([1, 2, 3], 5), 1)
  assert.equal(solve([-4, 4], 4), 1)
  assert.equal(solve([-4, 4], 3), 0)
})

test('3972 rejects bad inputs', () => {
  assert.throws(() => parseInput('{"nums":[],"x":1}'))
  assert.throws(() => parseInput('{"nums":[10],"x":1}'))
  assert.throws(() => parseInput('{"nums":[1],"x":10}'))
  assert.throws(() => parseInput('[1]'))
})

test('3972 trace agrees with the prefix-sum oracle on random inputs', () => {
  let seed = 3972
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(19) - 9)
    const x = rnd(10)
    assert.equal(solve(nums, x), oracle(nums, x), JSON.stringify({ nums, x }))
  }
})

test('3972 frame invariants hold', () => {
  const run = buildTrace(parseInput('{"nums":[3,-1,4,2],"x":4}'))
  assert.equal(run.frames[run.frames.length - 1].phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLineCount)
    assert.ok(frame.count >= 0 && frame.count <= run.result)
  }
})
