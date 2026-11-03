import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('4044 small cases', () => {
  assert.equal(solve([1, 1]), 0)
  assert.equal(solve([2, 1]), 1)
  assert.equal(solve([2, 5, 1, 4]), 1)
  assert.equal(solve([3, 3, 3, 3]), 0)
})

test('4044 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace([4, 1, 2, 3, 5, 6])
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('4044 rejects odd lengths and bad values', () => {
  assert.throws(() => parseInput('[1,2,3]'))
  assert.throws(() => parseInput('[1,0]'))
})

// Independent oracle: build each rotation explicitly and compare its halves.
function oracle(nums) {
  const n = nums.length
  const h = n / 2
  let count = 0
  for (let s = 0; s < n; s++) {
    const rot = [...nums.slice(s), ...nums.slice(0, s)]
    const a = rot.slice(0, h).reduce((x, y) => x + y, 0)
    const b = rot.slice(h).reduce((x, y) => x + y, 0)
    if (a > b) count += 1
  }
  return count
}

test('4044 random inputs match an explicit rotation oracle', () => {
  let seed = 4044
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 * (1 + rnd(6)) }, () => 1 + rnd(9))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
