import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2834 official examples', () => {
  assert.equal(solve({ n: 2, target: 3 }), 4)
  assert.equal(solve({ n: 3, target: 3 }), 8)
})

test('2834 a value equal to half of the target is allowed once', () => {
  // With target 2 the array 1, 2, 3 has no two distinct values that sum to 2.
  assert.equal(solve({ n: 3, target: 2 }), 6)
})

test('2834 rejects a missing target', () => {
  assert.throws(() => parseInput('{"n": 3}'))
})

// Independent oracle: enumerate every increasing set of n values up to 2n + target and keep the smallest valid sum.
function oracle(n, target) {
  const top = 2 * n + target
  let best = Infinity
  const pick = (start, chosen, sum) => {
    if (chosen.length === n) {
      best = Math.min(best, sum)
      return
    }
    for (let x = start; x <= top; x++) {
      if (chosen.some(y => y + x === target)) continue
      pick(x + 1, [...chosen, x], sum + x)
    }
  }
  pick(1, [], 0)
  return best % 1000000007
}

test('2834 random inputs match the subset oracle', () => {
  let seed = 2834
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(5)
    const target = 1 + rnd(8)
    assert.equal(solve({ n, target }), oracle(n, target), JSON.stringify({ n, target }))
  }
})
