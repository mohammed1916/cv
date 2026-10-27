import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, limit) => buildTrace(parseInput(JSON.stringify({ n, limit }))).result

test('2929 examples', () => {
  assert.equal(solve(5, 2), 3)
  assert.equal(solve(3, 3), 10)
})

test('2929 large limit has no overflow terms', () => {
  assert.equal(solve(4, 300), 15)
})

test('2929 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":0,"limit":2}'))
  assert.throws(() => parseInput('{"n":5,"limit":301}'))
})

// Independent oracle: for each first share a, count the second shares b that leave a third share within the limit.
function oracle(n, limit) {
  let count = 0
  for (let a = 0; a <= Math.min(n, limit); a++) {
    for (let b = 0; b <= Math.min(n, limit); b++) {
      const c = n - a - b
      if (c >= 0 && c <= limit) count++
    }
  }
  return count
}

test('2929 random cases match double enumeration', () => {
  let seed = 2929
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(300)
    const limit = 1 + rnd(300)
    assert.equal(solve(n, limit), oracle(n, limit), JSON.stringify({ n, limit }))
  }
})
