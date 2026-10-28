import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr1, arr2) => buildTrace({ arr1, arr2 }).result

test('1187 official examples', () => {
  assert.equal(solve([1, 5, 3, 6, 7], [1, 3, 2, 4]), 1)
  assert.equal(solve([1, 5, 3, 6, 7], [4, 3, 1]), 2)
  assert.equal(solve([1, 5, 3, 6, 7], [1, 6, 3, 3]), -1)
})

test('1187 no replacement needed for an already increasing array', () => {
  assert.equal(solve([1, 2, 3], [9]), 0)
})

test('1187 rejects values above 20', () => {
  assert.throws(() => parseInput('{"arr1":[21],"arr2":[1]}'), /0 to 20/)
})

// Independent oracle: for every position either keep the value or replace it with any element of arr2.
function oracle(arr1, arr2) {
  let best = Infinity
  const walk = (index, prev, cost) => {
    if (cost >= best) return
    if (index === arr1.length) { best = cost; return }
    if (arr1[index] > prev) walk(index + 1, arr1[index], cost)
    for (const replacement of arr2) if (replacement > prev) walk(index + 1, replacement, cost + 1)
  }
  walk(0, -Infinity, 0)
  return best === Infinity ? -1 : best
}

test('1187 random arrays match an exhaustive oracle', () => {
  let seed = 1187
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr1 = Array.from({ length: 1 + rnd(5) }, () => rnd(21))
    const arr2 = Array.from({ length: 1 + rnd(5) }, () => rnd(21))
    assert.equal(solve(arr1, arr2), oracle(arr1, arr2), JSON.stringify({ arr1, arr2 }))
  }
})
