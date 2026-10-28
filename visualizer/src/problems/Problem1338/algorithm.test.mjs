import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('1338 official examples', () => {
  assert.equal(solve([3, 3, 3, 3, 5, 5, 5, 2, 2, 7]), 2)
  assert.equal(solve([7, 7, 7, 7, 7, 7]), 1)
})

test('1338 removing exactly half is enough', () => {
  // Removing the 1s (two entries) already reaches half of four entries.
  assert.equal(solve([1, 1, 2, 3]), 1)
  assert.equal(solve([1, 2, 3, 4]), 2)
})

test('1338 rejects odd lengths and values outside 1 to 9', () => {
  assert.throws(() => parseInput('[1,1,2]'))
  assert.throws(() => parseInput('[10,10]'))
  assert.throws(() => parseInput('[0,1]'))
  assert.throws(() => parseInput('"abcd"'))
})

// Independent oracle: try every subset of distinct values and keep the smallest one
// whose removal takes out at least half of the entries.
function oracle(arr) {
  const distinct = [...new Set(arr)]
  const counts = new Map()
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1)
  let best = Infinity
  for (let mask = 0; mask < 1 << distinct.length; mask++) {
    let removed = 0
    let size = 0
    distinct.forEach((v, i) => {
      if ((mask >> i) & 1) {
        removed += counts.get(v)
        size++
      }
    })
    if (removed * 2 >= arr.length) best = Math.min(best, size)
  }
  return best
}

test('1338 random arrays match a subset-enumeration oracle', () => {
  let seed = 1338
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 2 * (1 + rnd(7)) }, () => 1 + rnd(6))
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
