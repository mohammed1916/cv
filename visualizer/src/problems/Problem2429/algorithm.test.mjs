import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (num1, num2) => buildTrace(parseInput(JSON.stringify({ num1, num2 }))).result

test('2429 official examples', () => {
  assert.equal(solve(3, 5), 3)
  assert.equal(solve(1, 12), 3)
})

test('2429 edge cases', () => {
  assert.equal(solve(1, 1), 1)
  assert.equal(solve(8, 1), 8)
})

test('2429 rejects zero', () => {
  assert.throws(() => parseInput('{"num1":0,"num2":1}'))
})

// Independent oracle: test every value with the right number of set bits and keep the one closest to num1 under XOR.
function oracle(num1, num2) {
  const bits = v => v.toString(2).split('1').length - 1
  let best = -1
  for (let x = 1; x < 4096; x++) {
    if (bits(x) !== bits(num2)) continue
    if (best === -1 || (x ^ num1) < (best ^ num1)) best = x
  }
  return best
}

test('2429 random pairs match an exhaustive search', () => {
  let seed = 2429
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const num1 = 1 + rnd(255)
    const num2 = 1 + rnd(255)
    assert.equal(solve(num1, num2), oracle(num1, num2), `${num1} ${num2}`)
  }
})
