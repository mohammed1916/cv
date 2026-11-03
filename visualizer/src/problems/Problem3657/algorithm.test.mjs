import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const sample = {
  asOf: 20, window: 10, minOrders: 3,
  customers: [{ id: 1, name: 'Ana' }, { id: 2, name: 'Ben' }, { id: 3, name: 'Cy' }, { id: 4, name: 'Dee' }],
  transactions: [
    { customer: 1, day: 5 }, { customer: 1, day: 12 }, { customer: 2, day: 11 }, { customer: 3, day: 13 },
    { customer: 1, day: 15 }, { customer: 2, day: 20 }, { customer: 3, day: 14 }, { customer: 4, day: 2 },
    { customer: 1, day: 19 }, { customer: 3, day: 18 }, { customer: 3, day: 20 }, { customer: 4, day: 3 },
  ],
}

test('sample: Ana (3 in window) and Cy (4 in window) are loyal', () => {
  assert.deepEqual(buildTrace(sample).result, [1, 3])
})

test('boundary: window is days 8 to 10, so day 7 is excluded and Ana has 2', () => {
  const input = { asOf: 10, window: 3, minOrders: 2, customers: [{ id: 1, name: 'Ana' }],
    transactions: [{ customer: 1, day: 7 }, { customer: 1, day: 8 }, { customer: 1, day: 10 }] }
  assert.deepEqual(buildTrace(input).result, [1])
  assert.deepEqual(buildTrace({ ...input, minOrders: 3 }).result, [])
})

test('parseInput rejects a transaction for an unknown customer', () => {
  const text = JSON.stringify({ ...sample, transactions: [{ customer: 9, day: 5 }] })
  assert.throws(() => parseInput(text), /known customer/)
})
