import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('4073 hand-checked lengths', () => {
  assert.equal(solve(1), 2)
  assert.equal(solve(2), 2)
  assert.equal(solve(3), 4)
  assert.equal(solve(4), 6)
})

test('4073 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":1000000000000001}'))
})

// Oracle: build good strings straight from the definition. Odd uniform strings are good, and a
// concatenation x + y of good strings is good when the last letter of x differs from the first of y.
function oracle(maxLen) {
  const good = [[], []]
  for (let L = 1; L <= maxLen; L++) {
    const set = new Set()
    if (L % 2 === 1) { set.add('a'.repeat(L)); set.add('b'.repeat(L)) }
    for (let i = 1; i < L; i++) {
      for (const x of good[i]) for (const y of good[L - i]) {
        if (x[x.length - 1] !== y[0]) set.add(x + y)
      }
    }
    good[L] = [...set]
  }
  return good.map(list => (list ? list.length : 0))
}

test('4073 small lengths match the definition-based enumeration', () => {
  const counts = oracle(9)
  for (let n = 1; n <= 9; n++) assert.equal(solve(n), counts[n] % 1000000007, `n=${n}`)
})

test('4073 large n stays reduced modulo the prime', () => {
  const r = solve(1000000000000000)
  assert.ok(Number.isInteger(r) && r >= 0 && r < 1000000007)
})
