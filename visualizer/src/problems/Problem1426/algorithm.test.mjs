import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = values => buildTrace(values).result

test('1426 sample inputs count occurrences with a successor', () => {
  assert.equal(solve([1, 2, 3]), 2)
  assert.equal(solve([1, 1, 3, 3, 5, 5, 7, 7]), 0)
  assert.equal(solve([1, 3, 2, 3, 5, 0]), 3)
})

test('1426 duplicate values are counted once per occurrence', () => {
  assert.equal(solve([1, 1, 2]), 2)
  assert.equal(solve([4, 4, 5, 5, 5]), 2)
})

test('1426 rejects malformed input', () => {
  assert.throws(() => parseInput('{"a":1}'), /list/)
  assert.throws(() => parseInput('[]'), /1 to 30/)
  assert.throws(() => parseInput('[1.5]'), /integers/)
  assert.throws(() => parseInput('[100]'), /0 to 99/)
})

// Independent oracle: compare every pair of positions with a direct scan.
test('1426 random arrays match a pairwise oracle', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(20)
    const values = Array.from({ length: len }, () => rnd(12))
    let expected = 0
    for (const x of values) if (values.some(y => y === x + 1)) expected++
    parseInput(JSON.stringify(values))
    assert.equal(solve(values), expected, JSON.stringify(values))
  }
})
