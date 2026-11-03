import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const oracle = nums => {
  const out = []
  for (let i = 0; i < nums.length; i += 2) for (let k = 0; k < nums[i]; k++) out.push(nums[i + 1])
  return out
}

test('hand-checked samples', () => {
  assert.deepEqual(buildTrace([2, 5, 1, 7]).result, [5, 5, 7])
  assert.deepEqual(buildTrace([3, 1, 1, 2, 2, 3]).result, [1, 1, 1, 2, 3, 3])
  assert.deepEqual(buildTrace([4, 9]).result, [9, 9, 9, 9])
})

test('random inputs agree with the oracle', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const nums = []
    for (let p = 0; p < 1 + rand(6); p++) nums.push(1 + rand(6), 1 + rand(100))
    assert.deepEqual(buildTrace(nums).result, oracle(nums), JSON.stringify(nums))
  }
})

test('every frame points at a real code line and Python line', () => {
  for (const frame of buildTrace([2, 5, 1, 7]).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2,3]'), /even number/)
  assert.throws(() => parseInput('[0,2]'), /frequency/)
  assert.throws(() => parseInput('[2,101]'), /value/)
})
