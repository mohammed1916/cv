import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, queries) => buildTrace({ n, queries }).result

test('2438 official example', () => {
  assert.deepEqual(solve(15, [[0, 1], [2, 2], [0, 3]]), [2, 4, 64])
})

test('2438 edge cases: a single power and a long product', () => {
  assert.deepEqual(solve(1, [[0, 0]]), [1])
  // 1023 = 2^0 + 2^1 + ... + 2^9, so the product of all ten powers is 2^45.
  assert.deepEqual(solve(1023, [[0, 9]]), [Number(2n ** 45n % 1000000007n)])
})

test('2438 rejects a query outside the powers', () => {
  assert.throws(() => parseInput('{"n":15,"queries":[[0,4]]}'))
  assert.throws(() => parseInput('{"n":15,"queries":[[2,1]]}'))
})

// Independent oracle: add the exponents of the chosen powers and take 2 to that total with modular exponentiation.
function oracle(n, queries) {
  const MOD = 1000000007n
  const exponents = []
  for (let e = 0; 2 ** e <= n; e++) if ((n >> e) & 1) exponents.push(e)
  return queries.map(([left, right]) => {
    let total = 0
    for (let k = left; k <= right; k++) total += exponents[k]
    let result = 1n
    let base = 2n
    let e = total
    while (e > 0) {
      if (e & 1) result = (result * base) % MOD
      base = (base * base) % MOD
      e >>= 1
    }
    return Number(result)
  })
}

test('2438 random queries match an exponent-sum oracle', () => {
  let seed = 2438
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(1000)
    const count = [...n.toString(2)].filter(bit => bit === '1').length
    const queries = Array.from({ length: 1 + rnd(5) }, () => {
      const left = rnd(count)
      return [left, left + rnd(count - left)]
    })
    assert.deepEqual(solve(n, queries), oracle(n, queries), JSON.stringify({ n, queries }))
  }
})
