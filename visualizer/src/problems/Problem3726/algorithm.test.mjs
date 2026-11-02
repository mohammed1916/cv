import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('3726 worked examples', () => {
  assert.equal(solve(1020030), 123)
  assert.equal(solve(1000), 1)
  assert.equal(solve(1), 1)
  assert.equal(solve(10), 1)
  assert.equal(solve(100200), 12)
})

test('3726 rejects invalid input', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":1.5}'))
})

test('3726 matches a string-replace oracle', () => {
  let seed = 3726
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(999999999)
    assert.equal(solve(n), Number(String(n).replace(/0/g, '')), String(n))
  }
})
