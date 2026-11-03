import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const spreadOf = parts => Math.max(...parts) - Math.min(...parts)

test('3669 worked example', () => {
  const parts = buildTrace({ n: 96, k: 2 }).result
  assert.deepEqual(parts, [8, 12])
  assert.deepEqual(buildTrace({ n: 72, k: 3 }).result, [3, 4, 6])
})

test('3669 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"n":3,"k":2}'))
  assert.throws(() => parseInput('{"n":10,"k":6}'))
})

// Oracle: every ordered tuple of divisors whose product is n.
function oracle(n, k) {
  const divs = []
  for (let d = 1; d <= n; d++) if (n % d === 0) divs.push(d)
  let bestSpread = Infinity
  const exact = (parts, rem) => {
    if (parts.length === k - 1) {
      bestSpread = Math.min(bestSpread, spreadOf([...parts, rem]))
      return
    }
    for (const d of divs) if (rem % d === 0) exact([...parts, d], rem / d)
  }
  exact([], n)
  return bestSpread
}

test('3669 matches the exhaustive oracle on small n', () => {
  for (let n = 4; n <= 80; n++) {
    for (let k = 2; k <= 4; k++) {
      let divCount = 0
      for (let d = 1; d <= n; d++) if (n % d === 0) divCount++
      if (divCount <= k) continue
      const parts = buildTrace({ n, k }).result
      assert.equal(parts.length, k)
      assert.equal(parts.reduce((a, b) => a * b, 1), n)
      assert.equal(spreadOf(parts), oracle(n, k), `n=${n} k=${k}`)
    }
  }
})
