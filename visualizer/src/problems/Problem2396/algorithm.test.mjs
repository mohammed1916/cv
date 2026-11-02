import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('2396 worked examples', () => {
  assert.equal(solve(9), false)
  assert.equal(solve(4), false)
})

test('2396 rejects n below the constraint', () => {
  assert.throws(() => parseInput('{"n":3}'))
})

// Oracle: independent string-based base conversion, checked for every base.
function oracle(n) {
  for (let b = 2; b <= n - 2; b++) {
    const s = n.toString(b)
    if (s !== [...s].reverse().join('')) return false
  }
  return true
}

test('2396 matches a string-based oracle for n from 4 to 300', () => {
  for (let n = 4; n <= 300; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})
