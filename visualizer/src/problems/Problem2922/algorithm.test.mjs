import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (items, orders) => buildTrace({ items, orders }).result

test('2922 teaching rule on a mixed sample', () => {
  const items = [
    { item_id: 1, item_brand: 'Acme' }, { item_id: 2, item_brand: 'Bolt' },
    { item_id: 3, item_brand: 'Acme' }, { item_id: 4, item_brand: 'Cora' },
  ]
  const orders = [
    { order_id: 10, item_id: 1, seller_id: 7 }, { order_id: 11, item_id: 3, seller_id: 7 },
    { order_id: 12, item_id: 2, seller_id: 8 }, { order_id: 13, item_id: 4, seller_id: 8 },
    { order_id: 14, item_id: 2, seller_id: 9 },
  ]
  // Seller 7 sold only Acme, seller 8 sold Bolt and Cora, seller 9 sold only Bolt.
  assert.deepEqual(solve(items, orders), [8])
})

test('2922 two brands for one seller keeps that seller', () => {
  const items = [{ item_id: 1, item_brand: 'Acme' }, { item_id: 2, item_brand: 'Bolt' }]
  const orders = [{ order_id: 10, item_id: 1, seller_id: 7 }, { order_id: 11, item_id: 2, seller_id: 7 }]
  assert.deepEqual(solve(items, orders), [7])
})

test('2922 an order for an unknown item is rejected', () => {
  assert.throws(() => parseInput('{"items":[{"item_id":1,"item_brand":"Acme"}],"orders":[{"order_id":1,"item_id":9,"seller_id":3}]}'))
})
