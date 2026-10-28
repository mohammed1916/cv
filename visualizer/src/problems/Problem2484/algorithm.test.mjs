import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2484 official examples', () => {
  assert.equal(solve('103301'), 2)
  assert.equal(solve('0000000'), 21)
  assert.equal(solve('9999900000'), 2)
})

test('2484 rejects a string shorter than five digits and non-digit characters', () => {
  assert.throws(() => parseInput('"1234"'))
  assert.throws(() => parseInput('"12a45"'))
})

// Independent oracle: test every choice of five positions and check the palindrome directly.
function oracle(s) {
  const n = s.length
  let count = 0
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) {
    for (let d = c + 1; d < n; d++) for (let e = d + 1; e < n; e++) {
      if (s[a] === s[e] && s[b] === s[d]) count++
    }
  }
  return count % 1000000007
}

test('2484 random digit strings match a five-position oracle', () => {
  let seed = 2484
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const length = 5 + rnd(8)
    const s = Array.from({ length }, () => String(rnd(4))).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
