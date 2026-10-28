import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2829 official examples', () => {
  assert.equal(solve({ n: 5, k: 4 }), 18)
  assert.equal(solve({ n: 2, k: 6 }), 3)
})

test('2829 a value equal to half of k is allowed once', () => {
  // With k = 2 the value 1 would pair with another 1, but the elements are distinct, so 1, 2, 3 is valid.
  assert.equal(solve({ n: 3, k: 2 }), 1 + 2 + 3)
})

test('2829 rejects a missing k', () => {
  assert.throws(() => parseInput('{"n": 3}'))
})

// Independent oracle: enumerate every increasing set of n values up to 2n + k and keep the smallest valid sum.
function oracle(n, k) {
  const top = 2 * n + k
  let best = Infinity
  const pick = (start, chosen, sum) => {
    if (chosen.length === n) {
      best = Math.min(best, sum)
      return
    }
    for (let x = start; x <= top; x++) {
      if (chosen.some(y => y + x === k)) continue
      pick(x + 1, [...chosen, x], sum + x)
    }
  }
  pick(1, [], 0)
  return best
}

test('2829 random inputs match the subset oracle', () => {
  let seed = 2829
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(5)
    const k = 1 + rnd(8)
    assert.equal(solve({ n, k }), oracle(n, k), JSON.stringify({ n, k }))
  }
})
