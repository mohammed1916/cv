import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (start, finish, limit, s) => buildTrace(parseInput(JSON.stringify({ start, finish, limit, s }))).result

test('2999 official examples', () => {
  assert.equal(solve('1', '6000', 4, '124'), 5)
  assert.equal(solve('1000', '2000', 4, '3000'), 0)
})

test('2999 a suffix digit above the limit gives zero', () => {
  assert.equal(solve('1', '100', 1, '2'), 0)
})

test('2999 rejects start above finish', () => {
  assert.throws(() => parseInput('{"start":"50","finish":"10","limit":4,"s":"1"}'))
})

// Independent oracle: test every integer in the range directly.
function oracle(start, finish, limit, s) {
  let count = 0
  for (let x = start; x <= finish; x++) {
    const text = String(x)
    if (text.endsWith(s) && [...text].every(ch => Number(ch) <= limit)) count++
  }
  return count
}

test('2999 random ranges match a direct-scan oracle', () => {
  let seed = 2999
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const start = 1 + rnd(2000)
    const finish = start + rnd(2000)
    const limit = 1 + rnd(9)
    const s = String(1 + rnd(9)) + Array.from({ length: rnd(3) }, () => String(rnd(10))).join('')
    assert.equal(solve(String(start), String(finish), limit, s), oracle(start, finish, limit, s), JSON.stringify({ start, finish, limit, s }))
  }
})
