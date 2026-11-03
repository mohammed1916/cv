import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (a, b) => buildTrace(parseInput(JSON.stringify({ a, b }))).result

test('3549 small products with the lowest degree first', () => {
  assert.deepEqual(solve([1, 2], [3, 4]), [3, 10, 8])
  assert.deepEqual(solve([5], [0, -2, 1]), [0, -10, 5])
  assert.deepEqual(solve([0], [7, 7]), [0, 0])
})

test('3549 rejects empty lists and out of range coefficients', () => {
  assert.throws(() => parseInput('{"a":[],"b":[1]}'))
  assert.throws(() => parseInput('{"a":[10],"b":[1]}'))
  assert.throws(() => parseInput('{"a":[1.5],"b":[1]}'))
})

// Independent check: the product's value at x must equal a(x) times b(x) for many integers x.
// Degrees are at most 8, so agreement at 41 points forces the coefficients to be exact.
function assertEvaluatesLikeProduct(a, b, result) {
  const evaluate = (c, x) => c.reduce((sum, coef, k) => sum + BigInt(coef) * BigInt(x) ** BigInt(k), 0n)
  for (let x = -20; x <= 20; x++) {
    assert.equal(evaluate(result, x), evaluate(a, x) * evaluate(b, x))
  }
}

test('3549 random products match a polynomial-evaluation oracle', () => {
  let seed = 3549
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const a = Array.from({ length: 1 + rnd(5) }, () => rnd(19) - 9)
    const b = Array.from({ length: 1 + rnd(5) }, () => rnd(19) - 9)
    const result = solve(a, b)
    assert.equal(result.length, a.length + b.length - 1)
    assertEvaluatesLikeProduct(a, b, result)
  }
})

test('3549 frames keep their pseudocode and python lines in range', () => {
  const run = buildTrace(parseInput('{"a":[1,0,2],"b":[4,5]}'))
  assert.equal(run.frames.length, 1 + 3 * 2 + 1)
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= 6)
    assert.ok(f.pythonLine >= 1)
    assert.equal(f.result.length, 4)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
