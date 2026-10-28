import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace(parseInput(JSON.stringify({ nums1, nums2 }))).result

// Independent oracle: for each target T, check whether a sum of exactly T is reachable for each array
// by a subset-sum style sweep (each zero may be any value from 1 to T).
function oracle(nums1, nums2) {
  const reach = (nums, T) => {
    let set = new Set([0])
    for (const v of nums) {
      const next = new Set()
      for (const r of set) {
        if (v === 0) { for (let x = 1; r + x <= T; x++) next.add(r + x) }
        else if (r + v <= T) next.add(r + v)
      }
      set = next
    }
    return set.has(T)
  }
  for (let T = 1; T <= 80; T++) {
    if (reach(nums1, T) && reach(nums2, T)) return T
  }
  return -1
}

test('2918 examples', () => {
  assert.equal(solve([3, 2, 0, 1, 0], [6, 5, 0]), 12)
  assert.equal(solve([2, 0, 2, 0], [1, 4]), -1)
})

test('2918 rejects an entry above 6', () => {
  assert.throws(() => parseInput('{"nums1":[7],"nums2":[1]}'))
})

test('2918 random arrays match a reachable-sum oracle', () => {
  let seed = 2918
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const arr = () => Array.from({ length: 1 + rnd(5) }, () => rnd(7))
  for (let t = 0; t < 300; t++) {
    const nums1 = arr()
    const nums2 = arr()
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
