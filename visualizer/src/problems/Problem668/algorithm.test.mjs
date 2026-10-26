import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('668 official examples', () => {
  assert.equal(buildTrace({ m: 3, n: 3, k: 5 }).result, 3)
  assert.equal(buildTrace({ m: 2, n: 3, k: 6 }).result, 6)
})

test('668 every table up to 12×12 matches sorting all products', () => {
  for (let m = 1; m <= 12; m++) for (let n = 1; n <= 12; n++) {
    const products = []
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) products.push(i * j)
    products.sort((a, b) => a - b)
    for (let k = 1; k <= m * n; k += 3) assert.equal(buildTrace({ m, n, k }).result, products[k - 1], JSON.stringify({ m, n, k }))
  }
})

test('668 rejects k beyond the table', () => {
  assert.throws(() => parseInput('{"m":2,"n":2,"k":5}'))
})
