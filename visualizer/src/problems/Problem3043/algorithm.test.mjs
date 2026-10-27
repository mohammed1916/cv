import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr1, arr2) => buildTrace({ arr1, arr2 }).result

test('3043 official examples', () => {
  assert.equal(solve([1, 10, 100], [1000]), 3)
  assert.equal(solve([1, 2, 3], [4, 4, 4]), 0)
})

test('3043 a shared first digit gives length one', () => {
  assert.equal(solve([15], [1500, 9]), 2)
  assert.equal(solve([7], [70]), 1)
})

test('3043 rejects an empty array', () => {
  assert.throws(() => parseInput('{"arr1":[],"arr2":[1]}'))
})

// Independent oracle: compare every pair of numbers character by character.
function oracle(arr1, arr2) {
  let best = 0
  for (const x of arr1) for (const y of arr2) {
    const a = String(x)
    const b = String(y)
    let k = 0
    while (k < a.length && k < b.length && a[k] === b[k]) k++
    best = Math.max(best, k)
  }
  return best
}

test('3043 random arrays match a pairwise oracle', () => {
  let seed = 3043
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr1 = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(999))
    const arr2 = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(999))
    assert.equal(solve(arr1, arr2), oracle(arr1, arr2), JSON.stringify({ arr1, arr2 }))
  }
})
