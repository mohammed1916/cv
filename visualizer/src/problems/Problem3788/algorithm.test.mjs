import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

const brute = nums => {
  let best = null
  for (let k = 0; k < nums.length - 1; k++) {
    const prefix = nums.slice(0, k + 1).reduce((a, b) => a + b, 0)
    const suffixMin = Math.min(...nums.slice(k + 1))
    const score = prefix - suffixMin
    if (best === null || score > best) best = score
  }
  return best
}

test('3788 official examples', () => {
  assert.equal(solve([10, -1, 3, -4, -5]), 17)
  assert.equal(solve([-7, -5, 3]), -2)
  assert.equal(solve([1, 1]), 0)
})

test('3788 matches brute force on small inputs', () => {
  let seed = 7
  const next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed }
  for (let t = 0; t < 500; t++) {
    const n = 2 + (next() % 7)
    const nums = Array.from({ length: n }, () => (next() % 41) - 20)
    assert.equal(solve(nums), brute(nums), JSON.stringify(nums))
  }
})

test('3788 trace frames carry phase, activeLine, message and pythonLine', () => {
  const { frames } = buildTrace({ nums: [10, -1, 3, -4, -5] })
  for (const f of frames) {
    assert.ok(f.phase && f.message && f.activeLine >= 1 && f.pythonLine >= 1)
  }
})

test('3788 parseInput accepts arrays and rejects bad input', () => {
  assert.deepEqual(parseInput('[1,2]'), { nums: [1, 2] })
  assert.throws(() => parseInput('[1]'))
  assert.throws(() => parseInput('[1.5,2]'))
})
