import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, m, k) => buildTrace(parseInput(JSON.stringify({ n, m, k }))).result

test('3405 official examples', () => {
  // All three values must be equal, so the four arrays are [v, v, v] for v from 1 to 4.
  assert.equal(solve(3, 4, 2), 4)
  assert.equal(solve(3, 2, 0), 2)
})

test('3405 one value allowed', () => {
  assert.equal(solve(4, 1, 3), 1)
  assert.equal(solve(4, 1, 2), 0)
})

test('3405 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":3,"m":2,"k":3}'))
  assert.throws(() => parseInput('{"n":0,"m":2,"k":0}'))
  assert.throws(() => parseInput('{"n":3,"m":7,"k":0}'))
})

// Independent oracle: enumerate every array with values 1..m and count the ones with exactly k equal neighbours.
function oracle(n, m, k) {
  let count = 0
  const values = Array(n).fill(1)
  const total = m ** n
  for (let code = 0; code < total; code++) {
    let c = code
    for (let i = 0; i < n; i++) { values[i] = (c % m) + 1; c = Math.floor(c / m) }
    let equal = 0
    for (let i = 0; i + 1 < n; i++) if (values[i] === values[i + 1]) equal++
    if (equal === k) count++
  }
  return count % 1000000007
}

test('3405 small arrays match the enumeration oracle', () => {
  for (let n = 1; n <= 6; n++) {
    for (let m = 1; m <= 4; m++) {
      for (let k = 0; k < n; k++) assert.equal(solve(n, m, k), oracle(n, m, k), `n=${n} m=${m} k=${k}`)
    }
  }
})

test('3405 random parameters match the enumeration oracle', () => {
  let seed = 3405
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const m = 1 + rnd(4)
    const k = rnd(n)
    assert.equal(solve(n, m, k), oracle(n, m, k), JSON.stringify({ n, m, k }))
  }
})
