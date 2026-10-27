import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1201 official examples', () => {
  assert.equal(solve({ n: 3, a: 2, b: 3, c: 5 }), 4)
  assert.equal(solve({ n: 4, a: 2, b: 3, c: 4 }), 6)
  assert.equal(solve({ n: 5, a: 2, b: 11, c: 13 }), 10)
})

test('1201 rejects a divisor of zero', () => {
  assert.throws(() => parseInput('{"n":3,"a":0,"b":3,"c":5}'))
})

// Independent oracle: walk the integers upward and count the divisible ones until the nth appears.
function oracle({ n, a, b, c }) {
  let count = 0
  for (let x = 1; ; x++) {
    if (x % a === 0 || x % b === 0 || x % c === 0) {
      count++
      if (count === n) return x
    }
  }
}

test('1201 seeded random cases match a linear walk', () => {
  let seed = 1201
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { n: 1 + rnd(20), a: 1 + rnd(20), b: 1 + rnd(20), c: 1 + rnd(20) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
