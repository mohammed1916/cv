import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('2183 worked examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5], 2), 7)
  assert.equal(solve([1, 2, 3, 4], 5), 0)
  assert.equal(solve([6], 6), 0)
  assert.equal(solve([2, 3], 6), 1)
})

test('2183 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":2}'))
  assert.throws(() => parseInput('{"nums":[0],"k":2}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

test('2183 random inputs match a direct product check', () => {
  let seed = 2183
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(20))
    const k = 1 + rnd(12)
    let expected = 0
    for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if ((nums[i] * nums[j]) % k === 0) expected++
    assert.equal(solve(nums, k), expected)
  }
})

test('2183 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"nums":[1,2,3],"k":2}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
