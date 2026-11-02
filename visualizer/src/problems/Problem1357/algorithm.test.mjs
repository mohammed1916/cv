import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result
const close = (actual, expected) => {
  assert.equal(actual.length, expected.length)
  actual.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-6, `bill ${i}: ${v} vs ${expected[i]}`))
}

test('1357 every n-th customer receives the discount', () => {
  close(solve({ n: 2, discount: 20, products: [1, 2], prices: [500, 250], orders: [{ product: [1], amount: [1] }, { product: [2], amount: [2] }, { product: [1, 2], amount: [1, 1] }] }), [500, 400, 750])
  close(solve({ n: 1, discount: 100, products: [1], prices: [9], orders: [{ product: [1], amount: [2] }] }), [0])
})

// Independent oracle: keep a running customer count and discount every n-th bill.
function oracle({ n, discount, products, prices, orders }) {
  const price = new Map(products.map((p, i) => [p, prices[i]]))
  let count = 0
  return orders.map(({ product, amount }) => {
    count++
    const subtotal = product.reduce((sum, p, i) => sum + price.get(p) * amount[i], 0)
    return count % n === 0 ? subtotal * (100 - discount) / 100 : subtotal
  })
}

test('1357 random cashier sessions match a counting oracle', () => {
  let seed = 1357
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const products = [1, 2, 3, 4, 5, 6].filter(() => rnd(3) > 0)
    if (!products.length) continue
    const input = {
      n: 1 + rnd(4), discount: 1 + rnd(100), products,
      prices: products.map(() => 1 + rnd(500)),
      orders: Array.from({ length: 1 + rnd(7) }, () => {
        const picked = products.filter(() => rnd(2) === 0)
        const chosen = picked.length ? picked : [products[0]]
        return { product: chosen, amount: chosen.map(() => 1 + rnd(3)) }
      }),
    }
    close(solve(input), oracle(input))
  }
})
