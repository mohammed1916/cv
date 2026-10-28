import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k, min_length) => buildTrace(parseInput(JSON.stringify({ s, k, min_length }))).result

test('2478 hand-checked examples', () => {
  // Three splits give parts that each start with a prime digit and end with a non-prime digit.
  assert.equal(solve('23542185131', 3, 2), 3)
  // The whole string starts with 2 and ends with 8, so one part is beautiful.
  assert.equal(solve('2468', 1, 4), 1)
  // The last digit 7 is prime, so no split can be beautiful.
  assert.equal(solve('2357', 2, 1), 0)
})

test('2478 rejects digits outside 1 to 9 and out-of-range fields', () => {
  assert.throws(() => parseInput('{"s":"20","k":1,"min_length":1}'))
  assert.throws(() => parseInput('{"s":"24","k":7,"min_length":1}'))
  assert.throws(() => parseInput('{"s":"24","k":1,"min_length":0}'))
})

// Independent oracle: try every set of cut positions and check each part directly.
function oracle(s, k, minLength) {
  const n = s.length
  const isPrime = c => '2357'.includes(c)
  let count = 0
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const cuts = [0]
    for (let i = 1; i < n; i++) if (mask & (1 << (i - 1))) cuts.push(i)
    cuts.push(n)
    const parts = cuts.slice(1).map((end, idx) => [cuts[idx], end])
    if (parts.length !== k) continue
    if (parts.every(([a, b]) => b - a >= minLength && isPrime(s[a]) && !isPrime(s[b - 1]))) count++
  }
  return count
}

test('2478 random cases match the cut-set oracle', () => {
  let seed = 2478
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(9) + 1
    const s = Array.from({ length: n }, () => String(rnd(9) + 1)).join('')
    const k = rnd(4) + 1
    const minLength = rnd(3) + 1
    assert.equal(solve(s, k, minLength), oracle(s, k, minLength), JSON.stringify({ s, k, minLength }))
  }
})
