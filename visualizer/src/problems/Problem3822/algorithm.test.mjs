import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

test('3822 orders move, cancel and match queries', () => {
  const ops = [
    ['addOrder', 1, 'buy', 10], ['addOrder', 2, 'buy', 10], ['addOrder', 3, 'sell', 10],
    ['getOrdersAtPrice', 'buy', 10], ['modifyOrder', 2, 12], ['getOrdersAtPrice', 'buy', 10],
    ['cancelOrder', 1], ['getOrdersAtPrice', 'buy', 10], ['getOrdersAtPrice', 'sell', 10], ['getOrdersAtPrice', 'buy', 12],
  ]
  assert.deepEqual(solve(ops), [null, null, null, [1, 2], null, [1], null, [], [3], [2]])
})

test('3822 a cancelled order cannot be modified', () => {
  assert.throws(() => buildTrace({ ops: [['addOrder', 5, 'sell', 3], ['cancelOrder', 5], ['modifyOrder', 5, 4]] }))
})

test('3822 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ ops: [['addOrder', 1, 'buy', 2], ['getOrdersAtPrice', 'buy', 2]] }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3822 rejects an unknown side', () => {
  assert.throws(() => parseInput('{"ops":[["addOrder",1,"long",4]]}'))
})
