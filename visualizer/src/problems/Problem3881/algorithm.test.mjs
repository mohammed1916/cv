import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: enumerate every L/R assignment and count the people who are visible to pos.
function oracle(n, pos, k) {
  let count = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let seen = 0
    for (let i = 0; i < n; i++) {
      const isL = (mask >> i) & 1
      if (i < pos && isL) seen++
      if (i > pos && !isL) seen++
    }
    if (seen === k) count++
  }
  return count
}

test('3881 worked examples', () => {
  assert.equal(buildTrace(parseInput('{"n":4,"pos":1,"k":1}')).result, 6)
  assert.equal(buildTrace(parseInput('{"n":4,"pos":3,"k":2}')).result, 6)
})

test('3881 matches an exhaustive oracle on small inputs', () => {
  for (let n = 1; n <= 9; n++) for (let pos = 0; pos < n; pos++) for (let k = 0; k <= n; k++) {
    assert.equal(buildTrace({ n, pos, k }).result, oracle(n, pos, k) % 1000000007, `n=${n} pos=${pos} k=${k}`)
  }
})
