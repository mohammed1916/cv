import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (l, r, k) => buildTrace(parseInput(JSON.stringify({ l, r, k }))).result

test('3966 official examples', () => {
  assert.equal(solve(10, 15, 1), 3)
  assert.equal(solve(201, 204, 2), 2)
})

test('3966 a single good value and an empty window', () => {
  assert.equal(solve(10, 10, 0), 0)
  assert.equal(solve(10, 10, 1), 1)
})

test('3966 rejects k above 9', () => {
  assert.throws(() => parseInput('{"l":10,"r":20,"k":10}'))
})

// Independent oracle: test every integer in the range by reading its digits as a string.
function oracle(l, r, k) {
  let count = 0
  for (let x = l; x <= r; x++) {
    const d = String(x).split('').map(Number)
    let ok = true
    for (let i = 1; i < d.length; i++) if (Math.abs(d[i] - d[i - 1]) > k) ok = false
    if (ok) count++
  }
  return count
}

test('3966 random ranges match a number-by-number oracle', () => {
  let seed = 3966
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const l = 10 + rnd(2000)
    const r = l + rnd(1000)
    const k = rnd(10)
    assert.equal(solve(l, r, k), oracle(l, r, k), `${l} ${r} ${k}`)
  }
})
