import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = instructions => buildTrace(parseInput(JSON.stringify({ instructions }))).result

test('1649 official examples', () => {
  assert.equal(solve([1, 5, 6, 2]), 1)
  assert.equal(solve([1, 2, 3, 6, 5, 4]), 3)
  assert.equal(solve([1, 3, 3, 3, 2, 4, 2, 1, 2]), 4)
})

test('1649 a value inserted at either extreme costs nothing', () => {
  assert.equal(solve([3, 3, 3]), 0)
  assert.equal(solve([1]), 0)
})

test('1649 rejects a value outside 1 to 10', () => {
  assert.throws(() => parseInput('{"instructions":[11]}'))
  assert.throws(() => parseInput('{"instructions":[]}'))
})

// Independent oracle: a Fenwick tree over values 1..10 gives the counts below and above each value.
function oracle(instructions) {
  const size = 10
  const tree = Array(size + 1).fill(0)
  const add = i => { for (let x = i; x <= size; x += x & -x) tree[x]++ }
  const prefix = i => { let s = 0; for (let x = i; x > 0; x -= x & -x) s += tree[x]; return s }
  let total = 0
  let cost = 0
  for (const v of instructions) {
    const less = prefix(v - 1)
    const greater = total - prefix(v)
    cost += Math.min(less, greater)
    add(v)
    total++
  }
  return cost % 1000000007
}

test('1649 random sequences match a Fenwick-tree oracle', () => {
  let seed = 1649
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const instructions = Array.from({ length: 1 + rnd(25) }, () => 1 + rnd(10))
    assert.equal(solve(instructions), oracle(instructions), JSON.stringify(instructions))
  }
})
