import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (order, friends) => buildTrace({ order, friends }).result

test('3668 worked examples', () => {
  assert.deepEqual(solve([2, 5, 1, 4, 3], [1, 4]), [1, 4])
  assert.deepEqual(solve([6, 3, 1, 2, 5, 4], [2, 6]), [6, 2])
})

test('3668 rejects a friend list that is not increasing', () => {
  assert.throws(() => parseInput('{"order":[1,2,3],"friends":[3,2]}'))
  assert.throws(() => parseInput('{"order":[1,1,3],"friends":[1]}'))
})

test('3668 matches a filter oracle on every permutation of four', () => {
  const perms = [[]]
  for (let v = 1; v <= 4; v++) {
    const next = []
    for (const p of perms) for (let i = 0; i <= p.length; i++) next.push([...p.slice(0, i), v, ...p.slice(i)])
    perms.length = 0
    perms.push(...next)
  }
  for (const order of perms) {
    for (let mask = 1; mask < 16; mask++) {
      const friends = [1, 2, 3, 4].filter((_, i) => mask >> i & 1)
      const set = new Set(friends)
      assert.deepEqual(solve(order, friends), order.filter(id => set.has(id)))
    }
  }
})
