import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('3909 official examples and both inclusive sums', () => {
  for (const [nums, expected, left, right] of [[[1, 3, 2, 1], 1, 4, 6], [[2, 4, 5, 2], 0, 11, 7], [[1, 2, 4, 3], -1, 7, 7]]) {
    const run = buildTrace(parseInput(JSON.stringify(nums)))
    assert.equal(run.result, expected)
    assert.equal(run.left, left)
    assert.equal(run.right, right)
  }
})

test('3909 exhaustive small bitonic arrays and accumulation frames', () => {
  let checked = 0
  for (let n = 3; n <= 7; n++) for (let mask = 0; mask < 4 ** n; mask++) {
    const nums = Array.from({ length: n }, (_, i) => 1 + Math.floor(mask / 4 ** i) % 4)
    const peak = nums.indexOf(Math.max(...nums))
    const valid = nums.every((v, i) => !i || (i <= peak ? v > nums[i - 1] : v < nums[i - 1]))
    if (!valid) { assert.throws(() => parseInput(JSON.stringify(nums))); continue }
    const run = buildTrace(parseInput(JSON.stringify(nums)))
    const left = nums.slice(0, peak + 1).reduce((a, b) => a + b, 0)
    const right = nums.slice(peak).reduce((a, b) => a + b, 0)
    assert.equal(run.peak, peak)
    assert.equal(run.result, left === right ? -1 : left > right ? 0 : 1)
    for (const frame of run.frames) {
      if (frame.phase === 'left') assert.equal(frame.left, nums.slice(0, frame.index + 1).reduce((a, b) => a + b, 0))
      if (frame.phase === 'right') assert.equal(frame.right, nums.slice(peak, frame.index + 1).reduce((a, b) => a + b, 0))
    }
    assert.equal(run.frames.filter(f => f.phase === 'left' || f.phase === 'right').length, n + 1)
    checked++
  }
  assert.ok(checked > 50)
})

test('3909 constraint-sized sums remain exact beyond 32 bits', () => {
  const nums = Array.from({ length: 100000 }, (_, i) => 1000000000 - Math.abs(50000 - i))
  const run = buildTrace(parseInput(JSON.stringify(nums)))
  assert.equal(run.peak, 50000)
  assert.equal(run.left - run.right, nums[0])
  assert.equal(run.result, 0)
  assert.ok(run.left > 2 ** 32 && Number.isSafeInteger(run.left))
  for (const data of [null, {}, [], [1, 2], [1, 1, 1], [2, 1, 2], [1, 2, 2, 1], [0, 2, 1], [1, 1000000001, 2], [1, 2.5, 1]]) assert.throws(() => parseInput(JSON.stringify(data)))
})
