import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3496 worked presets', () => {
  assert.equal(solve([4, -1, 7, 2, 3]), 16)
  assert.equal(solve([-5, 8, -2, 9, 1, -3]), 10)
  assert.equal(solve([6, 1]), 0)
})

test('3496 edge cases', () => {
  assert.equal(solve([5]), 0)
  assert.equal(solve([1, 2, 3]), 5)
  assert.equal(solve([-9, -9, -9]), -18)
})

test('3496 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[10]'))
  assert.throws(() => parseInput('{"nums":[1]}'))
})

// Oracle: play every sequence of deletions directly on the array, with no table.
function oracle(arr) {
  if (arr.length <= 2) return 0
  const sum = xs => xs.reduce((a, b) => a + b, 0)
  const options = [
    sum(arr.slice(0, 2)) + oracle(arr.slice(2)),
    sum(arr.slice(-2)) + oracle(arr.slice(0, -2)),
    sum([arr[0], arr[arr.length - 1]]) + oracle(arr.slice(1, -1)),
  ]
  return Math.max(...options)
}

test('3496 random arrays match a direct simulation oracle', () => {
  let seed = 3496
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(19) - 9)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3496 frames keep pseudocode and python line references inside range', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace([4, -1, 7, 2, 3])
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
