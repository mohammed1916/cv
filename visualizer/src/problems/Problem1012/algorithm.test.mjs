import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n))).result

test('1012 official examples', () => {
  assert.equal(solve(20), 1)
  assert.equal(solve(100), 10)
  assert.equal(solve(1000), 262)
})

test('1012 rejects zero and out-of-range input', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('100001'))
  assert.throws(() => parseInput('2.5'))
})

// Independent oracle: test every number from 1 to n for a repeated digit.
function oracle(n) {
  let count = 0
  for (let x = 1; x <= n; x++) {
    const s = String(x)
    if (new Set(s).size < s.length) count++
  }
  return count
}

test('1012 every n up to 3000 matches a direct count', () => {
  for (let n = 1; n <= 3000; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})

test('1012 larger values match a direct count', () => {
  let seed = 1012
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 40; t++) {
    const n = 1 + rnd(20000)
    assert.equal(solve(n), oracle(n), `n=${n}`)
  }
})
