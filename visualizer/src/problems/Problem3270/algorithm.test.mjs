import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (num1, num2, num3) => buildTrace({ num1, num2, num3 }).result

test('3270 worked examples', () => {
  assert.equal(solve(1, 10, 1000), 0)
  assert.equal(solve(987, 879, 798), 777)
  assert.equal(solve(1, 2, 3), 1)
})

test('3270 edge cases', () => {
  assert.equal(solve(9999, 9999, 9999), 9999)
  assert.equal(solve(1, 1, 1), 1)
  assert.equal(solve(5000, 1, 9999), 0)
})

test('3270 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"num1":0,"num2":1,"num3":1}'))
  assert.throws(() => parseInput('{"num1":10000,"num2":1,"num3":1}'))
})

// Oracle: build each four-digit string explicitly and take the digit-wise minimum with a different loop.
function oracle(a, b, c) {
  const pad = n => ('0000' + n).slice(-4)
  const [x, y, z] = [pad(a), pad(b), pad(c)]
  let out = ''
  for (let i = 0; i < 4; i++) out += Math.min(+x[i], +y[i], +z[i])
  return Number(out)
}

test('3270 random inputs match an oracle', () => {
  let seed = 3270
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const a = 1 + rnd(9999), b = 1 + rnd(9999), c = 1 + rnd(9999)
    assert.equal(solve(a, b, c), oracle(a, b, c), JSON.stringify([a, b, c]))
  }
})
