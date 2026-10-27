import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, x) => buildTrace(parseInput(JSON.stringify({ n, x }))).result

test('2787 official examples', () => {
  assert.equal(solve(10, 2), 1)
  assert.equal(solve(4, 1), 2)
})

test('2787 a single base can equal n', () => {
  assert.equal(solve(8, 3), 1)
})

test('2787 rejects an exponent outside 1 to 5', () => {
  assert.throws(() => parseInput('{"n":5,"x":6}'))
})

// Independent oracle: recursively choose strictly increasing bases until the power sum reaches n.
function oracle(n, x) {
  let count = 0
  const choose = (start, remaining) => {
    if (remaining === 0) { count++; return }
    for (let b = start; b ** x <= remaining; b++) choose(b + 1, remaining - b ** x)
  }
  choose(1, n)
  return count
}

test('2787 random inputs match a recursive enumeration oracle', () => {
  let seed = 2787
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(30)
    const x = 1 + rnd(5)
    assert.equal(solve(n, x), oracle(n, x), JSON.stringify({ n, x }))
  }
})
