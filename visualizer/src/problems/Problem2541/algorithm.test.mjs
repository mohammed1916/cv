import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: breadth-first search over arrays, one move adds k to one entry and subtracts k from another.
function oracle({ nums1, nums2, k }) {
  const lo = -6
  const hi = 14
  const n = nums1.length
  const key = arr => arr.join(',')
  const goal = key(nums2)
  let frontier = [nums1]
  const seen = new Set([key(nums1)])
  for (let dist = 0; frontier.length; dist++) {
    if (frontier.some(arr => key(arr) === goal)) return dist
    const next = []
    for (const arr of frontier) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) continue
          const t = arr.slice()
          t[i] += k
          t[j] -= k
          if (t.some(v => v < lo || v > hi)) continue
          const kk = key(t)
          if (!seen.has(kk)) { seen.add(kk); next.push(t) }
        }
      }
    }
    frontier = next
  }
  return -1
}

test('2541 examples', () => {
  assert.equal(solve({ nums1: [4, 3, 1, 4], nums2: [1, 3, 7, 1], k: 3 }), 2)
  assert.equal(solve({ nums1: [3, 8, 5, 2], nums2: [2, 4, 1, 6], k: 1 }), -1)
})

test('2541 rejects k outside 1 to 5', () => {
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[1],"k":0}'))
})

test('2541 random arrays match a breadth-first search oracle', () => {
  let seed = 2541
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const n = 1 + rnd(3)
    const nums1 = Array.from({ length: n }, () => 1 + rnd(6))
    const nums2 = Array.from({ length: n }, () => 1 + rnd(6))
    const k = 1 + rnd(3)
    const input = { nums1, nums2, k }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
