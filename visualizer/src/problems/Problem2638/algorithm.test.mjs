import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('2638 authored presets give the hand-counted totals', () => {
  assert.equal(solve([2, 4, 5, 7], 2), 9)
  assert.equal(solve([1, 2, 3, 4, 5, 6], 3), 27)
  assert.equal(solve([1, 3, 5, 7], 1), 16)
  assert.equal(solve([], 4), 1)
})

test('2638 a single value and a lone pair', () => {
  assert.equal(solve([9], 3), 2)
  assert.equal(solve([4, 7], 3), 3)
  assert.equal(solve([4, 8], 3), 4)
})

test('2638 input validation', () => {
  assert.throws(() => parseInput('{"nums":[1,1],"k":2}'))
  assert.throws(() => parseInput('{"nums":[0],"k":2}'))
  assert.throws(() => parseInput('{"nums":[1],"k":11}'))
  assert.throws(() => parseInput('[1,2]'))
})

function oracle(nums, k) {
  let count = 0
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    const chosen = nums.filter((_, i) => mask & (1 << i))
    const ok = chosen.every((a, i) => chosen.every((b, j) => i >= j || Math.abs(a - b) !== k))
    if (ok) count++
  }
  return count
}

test('2638 random small inputs match a subset brute force', () => {
  let seed = 2638
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const pool = Array.from({ length: 12 }, (_, i) => i + 1)
    const nums = []
    const size = rnd(9)
    while (nums.length < size) {
      const v = pool[rnd(pool.length)]
      if (!nums.includes(v)) nums.push(v)
    }
    const k = 1 + rnd(4)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('2638 frames keep valid pseudocode and Python lines and the final product matches', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace({ nums: [1, 2, 3, 5, 6, 9], k: 1 })
  assert.ok(code.length >= 12)
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.total >= 1)
  }
  const product = run.chains.reduce((p, c) => p * c.ways, 1)
  assert.equal(product, run.result)
  assert.equal(run.frames.at(-1).phase, 'done')
})
