import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, k) => buildTrace(parseInput(JSON.stringify({ n, k }))).result

test('3226 official examples', () => {
  assert.equal(solve(13, 4), 2)
  assert.equal(solve(21, 21), 0)
  assert.equal(solve(14, 13), -1)
})

test('3226 equal values need no changes', () => {
  assert.equal(solve(0, 0), 0)
})

test('3226 rejects a negative value', () => {
  assert.throws(() => parseInput('{"n":-1,"k":3}'))
})

// Independent oracle: k must be a sub-mask of n; the changes are the set bits left over, which is popcount(n) - popcount(k).
function popcount(x) {
  let c = 0
  while (x) { c += x & 1; x >>= 1 }
  return c
}

function oracle(n, k) {
  if ((n & k) !== k) return -1
  return popcount(n) - popcount(k)
}

test('3226 random pairs match a popcount oracle', () => {
  let seed = 3226
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(256)
    const k = rnd(256)
    assert.equal(solve(n, k), oracle(n, k), `${n} ${k}`)
  }
})
