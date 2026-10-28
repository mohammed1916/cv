import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

test('2499 official example', () => {
  assert.equal(solve([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]), 10)
})

test('2499 no clashes cost nothing', () => {
  assert.equal(solve([1, 2], [2, 1]), 0)
})

test('2499 two equal clashes with no spare index are impossible', () => {
  assert.equal(solve([1, 1], [1, 1]), -1)
})

test('2499 rejects arrays of different lengths', () => {
  assert.throws(() => parseInput(JSON.stringify({ nums1: [1], nums2: [1, 2] })))
})

// Independent oracle: Dijkstra over arrangements of nums1, where swapping positions i and j costs i + j.
function oracle(nums1, nums2) {
  const ok = a => a.every((v, i) => v !== nums2[i])
  const dist = new Map([[nums1.join(','), 0]])
  const pending = [[0, [...nums1]]]
  while (pending.length > 0) {
    pending.sort((x, y) => x[0] - y[0])
    const [d, arr] = pending.shift()
    if (dist.get(arr.join(',')) < d) continue
    if (ok(arr)) return d
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const t = [...arr]
        ;[t[i], t[j]] = [t[j], t[i]]
        const cost = d + i + j
        const key = t.join(',')
        if (!dist.has(key) || dist.get(key) > cost) {
          dist.set(key, cost)
          pending.push([cost, t])
        }
      }
    }
  }
  return -1
}

test('2499 random arrays match a Dijkstra oracle', () => {
  let seed = 2499
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const nums1 = Array.from({ length: n }, () => 1 + rnd(3))
    const nums2 = Array.from({ length: n }, () => 1 + rnd(3))
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
