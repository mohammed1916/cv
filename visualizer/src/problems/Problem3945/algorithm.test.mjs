import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3945 official examples', () => {
  assert.equal(solve(122), 5)
  assert.equal(solve(101), 2)
})

test('3945 a single digit scores its own value', () => {
  assert.equal(solve(7), 7)
})

test('3945 rejects zero', () => {
  assert.throws(() => parseInput('{"n":0}'))
})

// Independent oracle: the score equals the sum of the digits, read from the decimal string.
function oracle(n) {
  return [...String(n)].reduce((total, ch) => total + Number(ch), 0)
}

test('3945 random values match a digit-sum oracle', () => {
  let seed = 3945
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(1000000000)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
