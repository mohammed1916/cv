import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

function brute(nums) {
  let best = -1
  for (const v of new Set(nums)) {
    if (nums.filter(x => x === v).length === 1) best = Math.max(best, v)
  }
  return best
}

test('1133 hand-checked small cases', () => {
  assert.equal(solve([5, 7, 7, 3, 5, 9]), 9)
  assert.equal(solve([4, 4, 2, 2]), -1)
  assert.equal(solve([0]), 0)
  assert.equal(solve([8, 6, 6, 8, 1]), 1)
})

test('1133 matches a count-by-filter brute force on seeded lists', () => {
  let seed = 1133
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    const nums = Array.from({ length: len }, () => rnd(8))
    assert.equal(solve(nums), brute(nums), JSON.stringify(nums))
  }
})

test('1133 frames carry phase, line, message and snapshot', () => {
  const { frames } = buildTrace({ nums: [3, 1, 3, 2] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.equal(typeof frame.activeLine, 'number')
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(frames.at(-1).phase, 'done')
})

test('1133 parser rejects bad input', () => {
  assert.throws(() => parseInput('{"values":[1]}'))
  assert.throws(() => parseInput({ nums: [] }))
  assert.throws(() => parseInput({ nums: [-1] }))
  assert.throws(() => parseInput({ nums: [1.5] }))
})
