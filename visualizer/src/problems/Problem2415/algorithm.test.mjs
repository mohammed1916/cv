import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = root => buildTrace(parseInput(JSON.stringify({ root }))).result

test('2415 official examples', () => {
  assert.deepEqual(solve([2, 3, 5, 8, 13, 21, 34]), [2, 5, 3, 8, 13, 21, 34])
  assert.deepEqual(solve([7, 13, 11]), [7, 11, 13])
  assert.deepEqual(solve([0, 1, 2, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2]), [0, 2, 1, 0, 0, 0, 0, 2, 2, 2, 2, 1, 1, 1, 1])
})

test('2415 rejects a shape that is not a perfect tree', () => {
  assert.throws(() => parseInput('{"root":[1,2,3,4]}'), /perfect binary tree/)
})

// Independent oracle: walk the tree recursively, collect each depth left to right, reverse odd depths, and rebuild.
function oracle(values) {
  const levels = []
  const collect = (index, depth) => {
    if (index >= values.length) return
    levels[depth] = levels[depth] ?? []
    levels[depth].push(values[index])
    collect(2 * index + 1, depth + 1)
    collect(2 * index + 2, depth + 1)
  }
  collect(0, 0)
  const rebuilt = []
  levels.forEach((level, depth) => rebuilt.push(...(depth % 2 === 1 ? [...level].reverse() : level)))
  return rebuilt
}

test('2415 seeded random perfect trees match the recursive oracle', () => {
  let seed = 2415
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const size = [1, 3, 7, 15][rnd(4)]
    const values = Array.from({ length: size }, () => rnd(101))
    assert.deepEqual(solve(values), oracle(values), JSON.stringify(values))
  }
})
