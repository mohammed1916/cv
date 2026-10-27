import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, x) => buildTrace(parseInput(JSON.stringify({ n, x }))).result

test('3133 official examples', () => {
  assert.equal(solve(3, 4), 6)
  assert.equal(solve(2, 7), 15)
})

test('3133 edge cases', () => {
  assert.equal(solve(1, 5), 5)
  assert.equal(solve(4, 1), 7)
})

test('3133 rejects out of range values', () => {
  assert.throws(() => parseInput('{"n":0,"x":1}'))
  assert.throws(() => parseInput('{"n":2,"x":201}'))
})

// Independent oracle: the chosen values must all contain the bits of x, so the n-th such value from x upward is the answer.
function oracle(n, x) {
  let count = 0
  for (let v = x; ; v++) {
    if ((v & x) === x) {
      count++
      if (count === n) return v
    }
  }
}

test('3133 random pairs match a supermask enumeration', () => {
  let seed = 3133
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(200)
    const x = 1 + rnd(200)
    assert.equal(solve(n, x), oracle(n, x), `${n} ${x}`)
  }
})
