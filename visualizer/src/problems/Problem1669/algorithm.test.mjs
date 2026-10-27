import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1669 official-style examples', () => {
  assert.deepEqual(solve({ list1: [0, 1, 2, 3, 4, 5], a: 3, b: 4, list2: [10, 11, 12] }), [0, 1, 2, 10, 11, 12, 5])
  assert.deepEqual(solve({ list1: [0, 1, 2, 3, 4, 5, 6], a: 2, b: 5, list2: [10, 11, 12, 13, 14] }), [0, 1, 10, 11, 12, 13, 14, 6])
})

test('1669 a single removed node', () => {
  assert.deepEqual(solve({ list1: [7, 8, 9], a: 1, b: 1, list2: [5] }), [7, 5, 9])
})

test('1669 rejects a range that removes the last node', () => {
  assert.throws(() => parseInput('{"list1":[1,2,3],"a":1,"b":2,"list2":[9]}'))
})

// Independent oracle: array slicing.
function oracle({ list1, a, b, list2 }) {
  return [...list1.slice(0, a), ...list2, ...list1.slice(b + 1)]
}

test('1669 random inputs match an array-slicing oracle', () => {
  let seed = 1669
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const list1 = Array.from({ length: 3 + rnd(8) }, () => rnd(100))
    const a = 1 + rnd(list1.length - 2)
    const b = a + rnd(list1.length - 1 - a)
    const list2 = Array.from({ length: 1 + rnd(5) }, () => rnd(100))
    const input = { list1, a, b, list2 }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
