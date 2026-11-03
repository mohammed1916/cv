import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (nums, n) => buildTrace({ nums, n }).result

test('1470 sample inputs interleave the halves', () => {
  assert.deepEqual(solve([10, 20, 30, 40], 2), [10, 30, 20, 40])
  assert.deepEqual(solve([9, 1, 8, 2, 7, 3], 3), [9, 2, 1, 7, 8, 3])
  assert.deepEqual(solve([5, 6], 1), [5, 6])
})

// Oracle: result position j takes the first-half value for even j and the second-half value for odd j.
test('1470 random inputs match a position-based oracle', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(12)
    const nums = Array.from({ length: 2 * n }, () => 1 + rnd(1000))
    const expected = Array.from({ length: 2 * n }, (_, j) => nums[j % 2 === 0 ? j / 2 : n + (j - 1) / 2])
    assert.deepEqual(solve(nums, n), expected, JSON.stringify({ nums, n }))
  }
})

test('1470 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"n":2}'), /2n integers/)
  assert.throws(() => parseInput('{"nums":[1,2],"n":0}'), /n is an integer/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

test('1470 every frame points at a real phase and code line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ nums: [4, 5, 6, 1, 2, 3], n: 3 }).frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
