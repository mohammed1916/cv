import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, costs) => buildTrace({ n, costs }).result

test('3693 official examples', () => {
  assert.equal(solve(4, [1, 2, 3, 4]), 13)
  assert.equal(solve(4, [5, 1, 6, 2]), 11)
  assert.equal(solve(3, [9, 8, 3]), 12)
})

test('3693 a single step costs its own cost', () => {
  assert.equal(solve(1, [7]), 8)
})

test('3693 rejects a costs length that differs from n', () => {
  assert.throws(() => parseInput('{"n":3,"costs":[1,2]}'))
  assert.throws(() => parseInput('{"n":2,"costs":[1,2],"extra":1}'))
})

// Independent oracle: enumerate every sequence of jumps from step 0 to step n and keep the cheapest.
function oracle(n, costs) {
  let best = Infinity
  const walk = (at, total) => {
    if (at === n) { best = Math.min(best, total); return }
    for (let step = 1; step <= 3; step++) {
      const to = at + step
      if (to <= n) walk(to, total + costs[to - 1] + step * step)
    }
  }
  walk(0, 0)
  return best
}

test('3693 random inputs match a jump-enumeration oracle', () => {
  let seed = 3693
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const costs = Array.from({ length: n }, () => 1 + rnd(50))
    assert.equal(solve(n, costs), oracle(n, costs), JSON.stringify({ n, costs }))
  }
})
