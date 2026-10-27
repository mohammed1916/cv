import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3355 statement examples', () => {
  assert.equal(solve({ nums: [1, 0, 1], queries: [[0, 2]] }), true)
  assert.equal(solve({ nums: [4, 3, 2, 1], queries: [[1, 3], [0, 2]] }), false)
})

test('3355 rejects a query outside the array', () => {
  assert.throws(() => parseInput('{"nums":[1],"queries":[[0,1]]}'))
})

// Independent oracle: enumerate every subset of positions each query lowers, and look for nums exactly.
function oracle({ nums, queries }) {
  const n = nums.length
  let states = new Set([Array(n).fill(0).join(',')])
  for (const [l, r] of queries) {
    const next = new Set()
    for (const state of states) {
      const base = state.split(',').map(Number)
      const width = r - l + 1
      for (let mask = 0; mask < 1 << width; mask++) {
        const d = [...base]
        for (let b = 0; b < width; b++) if (mask & (1 << b)) d[l + b] += 1
        next.add(d.join(','))
      }
    }
    states = next
  }
  return states.has(nums.join(','))
}

test('3355 random cases match a subset-enumeration oracle', () => {
  let seed = 3355
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(4)
    const nums = Array.from({ length: n }, () => rnd(4))
    const queries = Array.from({ length: 1 + rnd(3) }, () => { const l = rnd(n); return [l, l + rnd(n - l)] })
    const input = { nums, queries }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
