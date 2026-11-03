import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: a non-decreasing string of length n over 5 letters is a multiset of size n,
// so there are C(n + 4, 4) of them. Computed with exact integer arithmetic.
function binomial(n, k) {
  let result = 1n
  for (let i = 1n; i <= BigInt(k); i++) result = (result * (BigInt(n) - BigInt(k) + i)) / i
  return result
}

// Brute force for small n: enumerate every string and keep the sorted ones.
function brute(n) {
  let count = 0
  const vowels = 'aeiou'
  const walk = (prefix, last) => {
    if (prefix.length === n) { count++; return }
    for (let c = last; c < 5; c++) walk(prefix + vowels[c], c)
  }
  walk('', 0)
  return count
}

test('n = 1 gives the five single vowels', () => {
  assert.equal(buildTrace(1).result, 5)
})

test('small lengths agree with brute-force enumeration', () => {
  for (let n = 1; n <= 6; n++) assert.equal(buildTrace(n).result, brute(n), `n=${n}`)
})

test('every length from 1 to 50 agrees with the binomial formula', () => {
  for (let n = 1; n <= 50; n++) {
    assert.equal(BigInt(buildTrace(n).result), binomial(n + 4, 4), `n=${n}`)
  }
})

test('each trace has one frame per length step plus the start and finish', () => {
  const run = buildTrace(10)
  assert.equal(run.frames.length, 1 + 9 + 2)
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid lengths are rejected', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('51'))
  assert.throws(() => parseInput('2.5'))
  assert.throws(() => parseInput('"3"'))
})
