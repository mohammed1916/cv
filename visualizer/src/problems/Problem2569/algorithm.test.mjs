import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2569 official example', () => {
  assert.deepEqual(solve({ nums1: [1, 0, 1], nums2: [0, 0, 0], queries: [[1, 1, 1], [2, 1, 0], [3, 0, 0]] }), [3])
})

test('2569 an add query uses the ones count at that moment', () => {
  // nums1 = [0,0], flip both -> two ones; add 2 * 2 = 4 to sum 1 -> 5; flip [0,0] -> one; add 1 * 1 -> 6.
  assert.deepEqual(solve({ nums1: [0, 0], nums2: [1, 0], queries: [[1, 0, 1], [2, 2, 0], [3, 0, 0], [1, 0, 0], [2, 1, 0], [3, 0, 0]] }), [5, 6])
})

test('2569 rejects a flip range outside the array', () => {
  assert.throws(() => parseInput('{"nums1":[0,1],"nums2":[0,0],"queries":[[1,0,2]]}'))
  assert.throws(() => parseInput('{"nums1":[0,2],"nums2":[0,0],"queries":[[3,0,0]]}'))
})

// Independent oracle: apply every query to plain arrays and count ones by scanning.
function oracle({ nums1, nums2, queries }) {
  const a = [...nums1]
  const b = [...nums2]
  const out = []
  for (const [type, x, y] of queries) {
    if (type === 1) for (let i = x; i <= y; i++) a[i] = 1 - a[i]
    else if (type === 2) for (let i = 0; i < b.length; i++) b[i] += x * a[i]
    else out.push(b.reduce((s, v) => s + v, 0))
  }
  return out
}

test('2569 random inputs match a plain-array simulation', () => {
  let seed = 2569
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const nums1 = Array.from({ length: n }, () => rnd(2))
    const nums2 = Array.from({ length: n }, () => rnd(6))
    const queries = []
    for (let q = 0; q < 1 + rnd(8); q++) {
      const type = 1 + rnd(3)
      if (type === 1) { const l = rnd(n); const r = l + rnd(n - l); queries.push([1, l, r]) }
      else if (type === 2) queries.push([2, rnd(6), 0])
      else queries.push([3, 0, 0])
    }
    const input = { nums1, nums2, queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
