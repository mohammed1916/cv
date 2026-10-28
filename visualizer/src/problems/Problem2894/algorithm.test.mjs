import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, m) => buildTrace(parseInput(JSON.stringify({ n, m }))).result

test('2894 official examples', () => {
  assert.equal(solve(10, 3), 19)
  assert.equal(solve(5, 6), 15)
  assert.equal(solve(4, 1), -10)
})

test('2894 edge cases and validation', () => {
  assert.equal(solve(1, 1), -1)
  assert.throws(() => parseInput('{"n":0,"m":1}'))
  assert.throws(() => parseInput('{"n":5,"m":1001}'))
})

// Independent oracle: add the numbers one at a time into the two sums.
function oracle(n, m) {
  let num1 = 0
  let num2 = 0
  for (let i = 1; i <= n; i++) {
    if (i % m === 0) num2 += i
    else num1 += i
  }
  return num1 - num2
}

test('2894 seeded random cases match a direct-sum oracle', () => {
  let seed = 2894
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(1000)
    const m = 1 + rnd(1000)
    assert.equal(solve(n, m), oracle(n, m), `${n} ${m}`)
  }
})
