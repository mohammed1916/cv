import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = prev => buildTrace(parseInput(JSON.stringify(prev))).result
// Count build orders directly: rooms that are built, each new room needs its parent built already.
const brute = prev => {
  const n = prev.length
  const rec = built => {
    if (built.size === n) return 1
    let total = 0
    for (let r = 0; r < n; r++) if (!built.has(r) && (prev[r] === -1 || built.has(prev[r]))) {
      built.add(r)
      total += rec(built)
      built.delete(r)
    }
    return total
  }
  return rec(new Set())
}

test('1916 invented trees', () => {
  assert.equal(solve([-1, 0, 0, 1, 1]), 8)
  assert.equal(solve([-1, 0, 1]), 1)
  assert.equal(solve([-1, 0, 0]), 2)
})

test('1916 matches direct count of build orders', () => {
  const cases = [[-1, 0, 0, 1, 1], [-1, 0, 0, 0, 0], [-1, 0, 1, 2, 3, 0], [-1, 0, 0, 2, 2, 1], [-1, 0, 1, 1, 0, 4]]
  for (const c of cases) assert.equal(solve(c), brute(c), JSON.stringify(c))
})
