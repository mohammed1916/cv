import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3767 official examples', () => {
  assert.equal(solve({ technique1: [5, 2, 10], technique2: [10, 3, 8], k: 2 }), 22)
  assert.equal(solve({ technique1: [10, 20, 30], technique2: [5, 15, 25], k: 2 }), 60)
  assert.equal(solve({ technique1: [1, 2, 3], technique2: [4, 5, 6], k: 0 }), 15)
})

test('3767 edge cases: one task, and k equal to n', () => {
  assert.equal(solve({ technique1: [7], technique2: [3], k: 1 }), 7)
  assert.equal(solve({ technique1: [1, 1], technique2: [9, 9], k: 2 }), 2)
})

test('3767 rejects mismatched lengths and k out of range', () => {
  assert.throws(() => parseInput('{"technique1":[1,2],"technique2":[1],"k":0}'))
  assert.throws(() => parseInput('{"technique1":[1],"technique2":[1],"k":2}'))
})

// Independent oracle: try every subset of tasks that use technique 1 and keep the best total.
function oracle({ technique1: a, technique2: b, k }) {
  const n = a.length
  let best = -Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    let count = 0
    let total = 0
    for (let i = 0; i < n; i++) {
      if (mask >> i & 1) { count++; total += a[i] } else total += b[i]
    }
    if (count >= k && total > best) best = total
  }
  return best
}

test('3767 random inputs match a subset-enumeration oracle', () => {
  let seed = 3767
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(8) + 1
    const input = {
      technique1: Array.from({ length: n }, () => rnd(30) + 1),
      technique2: Array.from({ length: n }, () => rnd(30) + 1),
      k: rnd(n + 1),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
