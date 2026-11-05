import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, key, k) => buildTrace(parseInput(JSON.stringify({ nums, key, k }))).result

test('2200 worked examples', () => {
  assert.deepEqual(solve([3, 4, 9, 1, 3, 9, 5], 9, 1), [1, 2, 3, 4, 5, 6])
  assert.deepEqual(solve([2, 2, 2, 2, 2], 2, 0), [0, 1, 2, 3, 4])
  assert.deepEqual(solve([1, 0, 0, 0, 0], 1, 1), [0, 1])
  assert.deepEqual(solve([7, 1, 1, 1, 7], 7, 2), [0, 1, 2, 3, 4])
})

test('2200 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"key":5,"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"key":1,"k":-1}'))
  assert.throws(() => parseInput('{"nums":[],"key":1,"k":1}'))
})

test('2200 random arrays match a direct double loop', () => {
  let seed = 2200
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(4))
    const key = nums[rnd(nums.length)]
    const k = rnd(nums.length + 1)
    const expected = []
    for (let i = 0; i < nums.length; i++) {
      if (nums.some((v, j) => v === key && Math.abs(i - j) <= k)) expected.push(i)
    }
    assert.deepEqual(solve(nums, key, k), expected, JSON.stringify({ nums, key, k }))
  }
})

test('2200 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"nums":[3,4,9],"key":9,"k":1}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
