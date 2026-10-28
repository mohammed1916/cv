import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (l, r, k) => buildTrace(parseInput(JSON.stringify({ l, r, k }))).result

test('3932 official examples', () => {
  assert.equal(solve(1, 9, 3), 2)
  assert.equal(solve(8, 30, 2), 3)
})

test('3932 zero counts as 0 to the k, and k = 1 counts every integer', () => {
  assert.equal(solve(0, 0, 5), 1)
  assert.equal(solve(4, 9, 1), 6)
})

test('3932 rejects k = 0', () => {
  assert.throws(() => parseInput('{"l":1,"r":9,"k":0}'))
})

// Independent oracle: for each y in the range, test whether some integer x in [-r, r] has x^k = y.
function oracle(l, r, k) {
  let count = 0
  for (let y = l; y <= r; y++) {
    let found = false
    for (let x = -r; x <= r && !found; x++) if (Math.pow(x, k) === y) found = true
    if (found) count++
  }
  return count
}

test('3932 random ranges match a direct-test oracle', () => {
  let seed = 3932
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const l = rnd(150)
    const r = l + rnd(50)
    const k = 1 + rnd(6)
    assert.equal(solve(l, r, k), oracle(l, r, k), `${l} ${r} ${k}`)
  }
})
