import test from 'node:test'
import assert from 'node:assert/strict'
import { lowbit, fenwickRange, updateChain, queryChain, fenwickRoles, describeFenwickOps } from './fenwickModel.js'

test('lowbit and ranges', () => {
  assert.equal(lowbit(12), 4)
  assert.deepEqual(fenwickRange(8), [1, 8])
  assert.deepEqual(fenwickRange(6), [5, 6])
  assert.deepEqual(fenwickRange(7), [7, 7])
})
test('update chain climbs with i += i & -i', () => {
  assert.deepEqual(updateChain(3, 8), [3, 4, 8])
  assert.deepEqual(updateChain(1, 8), [1, 2, 4, 8])
  assert.deepEqual(updateChain(9, 8), [])
})
test('query chain descends with i -= i & -i', () => {
  assert.deepEqual(queryChain(7), [7, 6, 4])
  assert.deepEqual(queryChain(0), [])
})
test('roles and descriptions', () => {
  const ops = [
    { type: 'query', index: 7, chain: [7, 6, 4], parts: [{ cell: 7, value: 1 }, { cell: 6, value: 2 }, { cell: 4, value: 3 }], total: 6, mode: 'sum' },
    { type: 'update', index: 3, value: 1, chain: [3, 4, 8], mode: 'sum' },
  ]
  assert.deepEqual(fenwickRoles(ops), { 7: 'query', 6: 'query', 4: 'update', 3: 'update', 8: 'update' })
  const lines = describeFenwickOps(ops)
  assert.match(lines[0], /i -= i & -i: 7 .* → 6 .* → 4/)
  assert.match(lines[0], /1 \+ 2 \+ 3 = 6/)
  assert.match(lines[1], /i \+= i & -i: 3 .* → 4 .* → 8/)
})
test('max mode wording', () => {
  const lines = describeFenwickOps([{ type: 'query', index: 2, chain: [2], parts: [{ cell: 2, value: 9 }], total: 9, mode: 'max' }])
  assert.match(lines[0], /best of positions 1\.\.2/)
})
