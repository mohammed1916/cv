import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, l, r) => buildTrace({ n, l, r }).result

// Oracle: enumerate every array of length n over [l, r] and test the zigzag rule directly.
function oracle(n, l, r) {
  let count = 0
  const a = Array(n).fill(l)
  const rec = i => {
    if (i === n) {
      let ok = true
      for (let k = 0; k + 1 < n && ok; k += 1) if (a[k] === a[k + 1]) ok = false
      for (let k = 0; k + 2 < n && ok; k += 1) {
        if ((a[k] < a[k + 1] && a[k + 1] < a[k + 2]) || (a[k] > a[k + 1] && a[k + 1] > a[k + 2])) ok = false
      }
      if (ok) count += 1
      return
    }
    for (let v = l; v <= r; v += 1) { a[i] = v; rec(i + 1) }
  }
  rec(0)
  return count
}

test('3916 hand-checked presets', () => {
  assert.equal(solve(3, 1, 3), 10)
  assert.equal(solve(4, 1, 4), oracle(4, 1, 4))
})

test('3916 length one counts every value', () => {
  assert.equal(solve(1, 5, 9), 5)
})

test('3916 length two counts unequal pairs', () => {
  assert.equal(solve(2, 1, 4), 12)
})

test('3916 a single value admits no zigzag of length three', () => {
  assert.equal(solve(3, 7, 7), 0)
})

test('3916 parser rejects a value range that is too wide', () => {
  assert.throws(() => parseInput('{"n":3,"l":1,"r":9}'))
})

test('3916 matches brute force on small inputs', () => {
  for (let n = 1; n <= 5; n += 1) {
    for (let l = 1; l <= 3; l += 1) {
      for (let r = l; r <= Math.min(l + 3, 5); r += 1) {
        assert.equal(solve(n, l, r), oracle(n, l, r), JSON.stringify({ n, l, r }))
      }
    }
  }
})
