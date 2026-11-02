import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result
const PY = python.split('\n')

test('2455 worked examples', () => {
  assert.equal(solve([1, 3, 6, 10, 12, 15]), 9)
  assert.equal(solve([1, 2, 4, 7, 11]), 0)
})

test('2455 a single qualifying value is its own average', () => {
  assert.equal(solve([18]), 18)
})

test('2455 floors the average', () => {
  assert.equal(solve([6, 12, 18]), 12)
  assert.equal(solve([6, 12]), 9)
})

test('2455 frames point at real python lines', () => {
  for (const f of buildTrace({ nums: [1, 6, 12] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2455 rejects out of range values', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('{"nums":[1001]}'))
})

test('2455 random inputs match a brute-force oracle', () => {
  let seed = 2455
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(20) }, () => 1 + rnd(200))
    const ok = nums.filter(x => x % 2 === 0 && x % 3 === 0)
    const expected = ok.length ? Math.floor(ok.reduce((a, b) => a + b, 0) / ok.length) : 0
    assert.equal(solve(nums), expected, JSON.stringify(nums))
  }
})
