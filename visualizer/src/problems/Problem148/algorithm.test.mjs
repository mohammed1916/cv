import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('hand-checked lists, including duplicates and the empty list', () => {
  assert.deepEqual(buildTrace([9, -3, 5, 0, 7, 2]).result, [-3, 0, 2, 5, 7, 9])
  assert.deepEqual(buildTrace([4, 4, 1, 4]).result, [1, 4, 4, 4])
  assert.deepEqual(buildTrace([]).result, [])
  assert.deepEqual(buildTrace([42]).result, [42])
})

test('random lists agree with Array.prototype.sort on every length from 0 to 32', () => {
  let state = 77
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let len = 0; len <= 32; len++) {
    for (let t = 0; t < 5; t++) {
      const values = Array.from({ length: len }, () => rand(200001) - 100000)
      const expected = [...values].sort((a, b) => a - b)
      assert.deepEqual(buildTrace(values).result, expected, JSON.stringify(values))
    }
  }
})

test('the sorted output is a permutation of the input', () => {
  const values = [5, 5, -1, 0, 9, -1, 3]
  const { result } = buildTrace(values)
  assert.deepEqual([...result].sort((a, b) => a - b), [...values].sort((a, b) => a - b))
  assert.equal(result.length, values.length)
})

test('split and merge frames are present and the run ends with done', () => {
  const run = buildTrace([3, 1, 2])
  assert.ok(run.frames.some(f => f.phase === 'split'))
  assert.ok(run.frames.some(f => f.phase === 'merge'))
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 17)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('{"a":1}'), /JSON array/)
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33]'), /0 to 32/)
  assert.throws(() => parseInput('[100001]'), /-100000 to 100000/)
  assert.throws(() => parseInput('[1.5]'), /integer/)
})
