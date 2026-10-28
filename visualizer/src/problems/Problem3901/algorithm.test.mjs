import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, p, queries) => buildTrace(parseInput(JSON.stringify({ nums, p, queries }))).result

test('3901 official examples', () => {
  assert.equal(solve([4, 8, 12, 16], 2, [[0, 3], [2, 6]]), 1)
  assert.equal(solve([4, 5, 7, 8], 3, [[0, 6], [1, 9], [2, 3]]), 2)
  assert.equal(solve([5, 7, 9], 2, [[1, 4], [2, 8]]), 0)
})

test('3901 a single pair with gcd p is good, a lone element of size n is not', () => {
  // After the update the pair 8, 6 has gcd 2 and size 2 < 3.
  assert.equal(solve([3, 8, 12], 2, [[0, 6]]), 1)
  // Only one multiple of 2 exists, so no subset has gcd 2 with size below 2.
  assert.equal(solve([2, 3], 2, [[1, 5]]), 1)
  assert.equal(solve([3, 5], 2, [[0, 1]]), 0)
})

test('3901 rejects a bad query', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"p":1,"queries":[[5,1]]}'), /out of range/)
})

// Independent oracle: enumerate every subset of the array and test gcd and size directly.
function oracle(nums, p, queries) {
  const arr = [...nums]
  let count = 0
  for (const [index, value] of queries) {
    arr[index] = value
    const n = arr.length
    let good = false
    for (let mask = 1; mask < 1 << n && !good; mask++) {
      let size = 0
      let g = 0
      const gcd2 = (a, b) => (b === 0 ? a : gcd2(b, a % b))
      for (let i = 0; i < n; i++) if (mask & (1 << i)) { size++; g = gcd2(g, arr[i]) }
      if (size < n && g === p) good = true
    }
    if (good) count++
  }
  return count
}

test('3901 random inputs match a brute-force subset oracle', () => {
  let seed = 3901
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(5)
    const nums = Array.from({ length: n }, () => 1 + rnd(24))
    const p = 1 + rnd(6)
    const queries = Array.from({ length: 1 + rnd(5) }, () => [rnd(n), 1 + rnd(24)])
    assert.equal(solve(nums, p, queries), oracle(nums, p, queries), JSON.stringify({ nums, p, queries }))
  }
})
