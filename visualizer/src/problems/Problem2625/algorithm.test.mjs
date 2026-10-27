import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'


const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2625 flattening depth examples', () => {
  const arr = [1, [2, [3, [4]], 5]]
  assert.deepEqual(solve({ arr, n: 0 }), [1, [2, [3, [4]], 5]])
  assert.deepEqual(solve({ arr, n: 1 }), [1, 2, [3, [4]], 5])
  assert.deepEqual(solve({ arr, n: 2 }), [1, 2, 3, [4], 5])
  assert.deepEqual(solve({ arr, n: 5 }), [1, 2, 3, 4, 5])
})

test('2625 an empty array stays empty', () => {
  assert.deepEqual(solve({ arr: [], n: 3 }), [])
})

test('2625 rejects a string leaf', () => {
  assert.throws(() => parseInput('{"arr":[1,"a"],"n":1}'))
})

test('2625 random nested arrays match the built-in flat', () => {
  let seed = 2625
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const build = depth => {
    const items = []
    const count = 1 + rnd(4)
    for (let i = 0; i < count; i++) {
      if (depth > 0 && rnd(3) === 0) items.push(build(depth - 1))
      else items.push(rnd(100))
    }
    return items
  }
  let checked = 0
  for (let t = 0; t < 300; t++) {
    const arr = build(4)
    const n = rnd(6)
    const input = { arr, n }
    try {
      parseInput(JSON.stringify(input))
    } catch {
      continue // the input is outside the visualization limits, so skip it
    }
    assert.deepEqual(solve(input), arr.flat(n), JSON.stringify(input))
    checked++
  }
  assert.ok(checked > 100)
})
