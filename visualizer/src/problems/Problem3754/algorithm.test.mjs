import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('3754 worked examples', () => {
  assert.equal(solve(10203), 738)
  assert.equal(solve(1000), 1)
  assert.equal(solve(0), 0)
  assert.equal(solve(5), 25)
})

test('3754 rejects invalid input', () => {
  assert.throws(() => parseInput('{"n":-1}'))
  assert.throws(() => parseInput('{"n":2.5}'))
})

function oracle(n) {
  const s = String(n)
  const x = Number(s.replace(/0/g, '') || '0')
  const sum = [...s].reduce((a, c) => a + Number(c), 0)
  return x * sum
}

test('3754 random values match a string oracle', () => {
  let seed = 3754
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(1000000000)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
