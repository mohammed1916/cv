import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify({ arr }))).result

test('2649 examples yield values in depth-first order', () => {
  assert.deepEqual(solve([1, 2, 3]), [1, 2, 3])
  assert.deepEqual(solve([[1, 2], 3, [[4]]]), [1, 2, 3, 4])
})

test('2649 empty arrays yield nothing and an empty input yields nothing', () => {
  assert.deepEqual(solve([]), [])
  assert.deepEqual(solve([[], [[]], 7]), [7])
})

test('2649 rejects non-integers and excess depth', () => {
  assert.throws(() => parseInput(JSON.stringify({ arr: [1.5] })))
  assert.throws(() => parseInput(JSON.stringify({ arr: [[[[[[1]]]]]] })))
})

test('2649 random nested arrays match Array.prototype.flat(Infinity)', () => {
  let seed = 2649
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const build = depth => {
    const size = rnd(4)
    return Array.from({ length: size }, () => (depth < 4 && rnd(2) ? build(depth + 1) : rnd(201) - 100))
  }
  for (let t = 0; t < 300; t++) {
    const arr = build(0)
    const leaves = arr.flat(Infinity).length
    if (leaves > 30) continue
    assert.deepEqual(solve(arr), arr.flat(Infinity), JSON.stringify(arr))
  }
})
