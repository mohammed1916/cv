import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const names = result => result.packed.map(set => set.item_category)

test('3052 default warehouse packs Lamp, Desk and Bin with 80 left', () => {
  const input = {
    capacity: 600,
    inventory: [
      { item_id: 1, item_type: 'prime', item_category: 'Lamp', square_footage: 120 },
      { item_id: 2, item_type: 'prime', item_category: 'Lamp', square_footage: 80 },
      { item_id: 3, item_type: 'prime', item_category: 'Desk', square_footage: 150 },
      { item_id: 4, item_type: 'prime', item_category: 'Desk', square_footage: 100 },
      { item_id: 5, item_type: 'prime', item_category: 'Shelf', square_footage: 300 },
      { item_id: 6, item_type: 'non_prime', item_category: 'Rug', square_footage: 90 },
      { item_id: 7, item_type: 'non_prime', item_category: 'Rug', square_footage: 60 },
      { item_id: 8, item_type: 'non_prime', item_category: 'Bin', square_footage: 70 },
      { item_id: 9, item_type: 'non_prime', item_category: 'Crate', square_footage: 200 },
      { item_id: 10, item_type: 'non_prime', item_category: 'Crate', square_footage: 50 },
    ],
  }
  const { result } = buildTrace(input)
  assert.deepEqual(names(result), ['Lamp', 'Desk', 'Bin'])
  assert.equal(result.remaining, 80)
})

test('3052 tight space packs Pair and Tote with 60 left', () => {
  const { result } = buildTrace({
    capacity: 300,
    inventory: [
      { item_id: 11, item_type: 'prime', item_category: 'Pair', square_footage: 180 },
      { item_id: 12, item_type: 'prime', item_category: 'Quad', square_footage: 200 },
      { item_id: 13, item_type: 'non_prime', item_category: 'Bin', square_footage: 70 },
      { item_id: 14, item_type: 'non_prime', item_category: 'Tote', square_footage: 60 },
    ],
  })
  assert.deepEqual(names(result), ['Pair', 'Tote'])
  assert.equal(result.remaining, 60)
})

test('3052 prime sets get the space before non-prime sets, and bad rows are rejected', () => {
  const { result } = buildTrace({
    capacity: 90,
    inventory: [
      { item_id: 1, item_type: 'prime', item_category: 'Solo', square_footage: 90 },
      { item_id: 2, item_type: 'non_prime', item_category: 'Cup', square_footage: 10 },
    ],
  })
  assert.deepEqual(names(result), ['Solo'])
  assert.equal(result.remaining, 0)
  assert.throws(() => parseInput('{"capacity":90,"inventory":[{"item_id":1,"item_type":"prime","item_category":"Solo","square_footage":91}]}'))
})
