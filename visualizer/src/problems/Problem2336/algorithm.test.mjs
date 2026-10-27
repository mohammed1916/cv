import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2336 official example, with the constructor call left out', () => {
  // Expected: [null, 1, 2, 3, null, 1, 4, 5] for SmallestInfiniteSet, addBack(2), pop x3, addBack(1), pop x3.
  const input = {
    operations: ['addBack', 'popSmallest', 'popSmallest', 'popSmallest', 'addBack', 'popSmallest', 'popSmallest', 'popSmallest'],
    arguments: [[2], [], [], [], [1], [], [], []],
  }
  assert.deepEqual(solve(input), [null, 1, 2, 3, null, 1, 4, 5])
})

test('2336 adding back a number that was never taken changes nothing', () => {
  assert.deepEqual(solve({ operations: ['addBack', 'popSmallest'], arguments: [[5], []] }), [null, 1])
})

test('2336 rejects an unknown operation and a bad addBack value', () => {
  assert.throws(() => parseInput('{"operations":["peek"],"arguments":[[]]}'))
  assert.throws(() => parseInput('{"operations":["addBack"],"arguments":[[0]]}'))
})

// Independent oracle: the set is 1 to 200 (far more than any sequence here pops), and each operation works on that set directly.
function oracle({ operations, arguments: args }) {
  const present = new Set(Array.from({ length: 200 }, (_, i) => i + 1))
  return operations.map((op, i) => {
    if (op === 'popSmallest') {
      const smallest = Math.min(...present)
      present.delete(smallest)
      return smallest
    }
    present.add(args[i][0])
    return null
  })
}

test('2336 random operation sequences match a set-based oracle', () => {
  let seed = 2336
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(12)
    const operations = []
    const args = []
    for (let i = 0; i < length; i++) {
      if (rnd(2)) { operations.push('popSmallest'); args.push([]) } else { operations.push('addBack'); args.push([1 + rnd(30)]) }
    }
    const input = { operations, arguments: args }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
