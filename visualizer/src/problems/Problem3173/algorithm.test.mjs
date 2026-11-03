import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3173 worked arrays', () => {
  assert.deepEqual(solve([1, 2, 3, 4]), [3, 3, 7])
  assert.deepEqual(solve([8, 0, 5]), [8, 5])
  assert.deepEqual(solve([6]), [])
})

test('3173 random arrays match a direct OR oracle', () => {
  let seed = 3173
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 300; trial++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(1024))
    const expected = []
    for (let i = 0; i + 1 < nums.length; i++) expected.push(nums[i] | nums[i + 1])
    assert.deepEqual(solve(nums), expected, JSON.stringify(nums))
  }
})

test('3173 frames carry real pseudocode and python lines and the growing answer', () => {
  const run = buildTrace([1, 2, 3, 4])
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 5, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 6, `pythonLine ${frame.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).answer.length, 3)
})

test('3173 parse rejects bad values and lengths', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1024]'))
  assert.throws(() => parseInput('[-1]'))
  assert.deepEqual(parseInput('[1,2]'), [1, 2])
})
