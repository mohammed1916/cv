import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (a, b) => buildTrace({ a, b }).result

test('2427 official examples', () => {
  assert.equal(solve(12, 6), 4)
  assert.equal(solve(25, 30), 2)
})

test('2427 coprime numbers share only the factor one', () => {
  assert.equal(solve(7, 9), 1)
})

test('2427 rejects zero', () => {
  assert.throws(() => parseInput('{"a":0,"b":3}'))
})

// Independent oracle: the common factors are exactly the divisors of gcd(a, b).
function oracle(a, b) {
  let x = a
  let y = b
  while (y) [x, y] = [y, x % y]
  let count = 0
  for (let d = 1; d <= x; d++) if (x % d === 0) count++
  return count
}

test('2427 random pairs match a gcd-divisor oracle', () => {
  let seed = 2427
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const a = 1 + rnd(60)
    const b = 1 + rnd(60)
    assert.equal(solve(a, b), oracle(a, b), `${a} ${b}`)
  }
})
