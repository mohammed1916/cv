import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.odd >= 0 && frame.even >= 0)
  }
}

test('3247 worked examples from the authored presets', () => {
  assert.equal(solve([1, 2, 3]), 4)
  assert.equal(solve([2, 4, 6]), 0)
  assert.equal(solve([7]), 1)
})

test('3247 single values and edge cases', () => {
  assert.equal(solve([0]), 0)
  assert.equal(solve([1, 1]), 2)
})

test('3247 parseInput rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('{"nums":[1]}'))
})

// Independent oracle: enumerate every nonempty subset of a small array.
function oracle(nums) {
  let count = 0
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let sum = 0
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) sum += nums[i]
    if (sum % 2 === 1) count++
  }
  return count % 1000000007
}

test('3247 random arrays match a subset enumeration oracle', () => {
  let seed = 3247
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(30))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3247 frames keep pseudocode and python lines valid and counts in range', () => {
  checkFrames(buildTrace([5, 2, 9, 0, 4]))
  checkFrames(buildTrace(Array.from({ length: 16 }, (_, i) => i * 37)))
})
