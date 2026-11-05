import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2206 worked examples', () => {
  assert.equal(solve([3, 2, 3, 2, 2, 2]), true)
  assert.equal(solve([1, 2, 3, 4]), false)
  assert.equal(solve([5, 5]), true)
  assert.equal(solve([1, 1, 1, 1, 2, 2]), true)
})

test('2206 rejects invalid input', () => {
  assert.throws(() => parseInput('[1,2,3]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0,0]'))
})

test('2206 random arrays match a pair-by-pair simulation', () => {
  let seed = 2206
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const half = 1 + rnd(6)
    const nums = Array.from({ length: 2 * half }, () => 1 + rnd(4))
    const pool = nums.slice()
    let ok = true
    while (pool.length) {
      const x = pool.pop()
      const j = pool.indexOf(x)
      if (j < 0) { ok = false; break }
      pool.splice(j, 1)
    }
    assert.equal(solve(nums), ok, JSON.stringify(nums))
  }
})

test('2206 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[1,1]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
