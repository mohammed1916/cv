import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
  }
}

test('3979 authored examples', () => {
  assert.equal(solve([4, 1, 9, 2, 7], 2), 16)
  assert.equal(solve([3, 8, 1], 1), 11)
  assert.equal(solve([5, 5], 1), 10)
})

test('3979 the pair must be at least k apart', () => {
  assert.equal(solve([10, 1, 1, 1], 3), 11)
  assert.equal(solve([1, 9, 1, 1], 3), 2)
})

test('3979 rejects bad gaps and sizes', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":2}'))
  assert.throws(() => parseInput('{"nums":[1],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2,3],"k":0}'))
})

test('3979 random inputs match a pairwise oracle', () => {
  let seed = 3979
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const nums = Array.from({ length: n }, () => 1 + rnd(30))
    const k = 1 + rnd(n - 1)
    let expected = -Infinity
    for (let i = 0; i < n; i++) for (let j = i + k; j < n; j++) expected = Math.max(expected, nums[i] + nums[j])
    const run = buildTrace({ nums, k })
    assert.equal(run.result, expected, JSON.stringify({ nums, k }))
    checkFrames(run)
  }
})
