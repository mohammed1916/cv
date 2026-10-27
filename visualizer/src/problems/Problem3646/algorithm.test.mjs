import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('3646 official examples', () => {
  assert.equal(solve(2), 22)
  assert.equal(solve(33), 212)
  assert.equal(solve(1), 22)
})

test('3646 the answer is strictly greater than n', () => {
  assert.equal(solve(212), 333)
  assert.equal(solve(4444), 23332)
})

test('3646 rejects a zero input', () => {
  assert.throws(() => parseInput('{"n":0}'))
})

// Independent oracle: list every special palindrome below two million with arithmetic digit counts,
// then answer with the first list entry above n.
const specials = []
for (let x = 1; x <= 2000000; x++) {
  let rest = x
  let reversed = 0
  const counts = new Array(10).fill(0)
  while (rest > 0) {
    const digit = rest % 10
    counts[digit] += 1
    reversed = reversed * 10 + digit
    rest = Math.floor(rest / 10)
  }
  if (reversed !== x) continue
  if (counts.every((c, d) => c === 0 || c === d)) specials.push(x)
}

test('3646 random inputs match the precomputed list', () => {
  let seed = 3646
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5000)
    assert.equal(solve(n), specials.find(x => x > n), String(n))
  }
})
