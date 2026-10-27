import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3356 statement examples', () => {
  assert.equal(solve({ nums: [2, 0, 2], queries: [[0, 2, 1], [0, 2, 1], [1, 1, 3]] }), 2)
  assert.equal(solve({ nums: [4, 3, 2, 1], queries: [[1, 3, 2], [0, 2, 1]] }), -1)
})

test('3356 rejects a value above 4', () => {
  assert.throws(() => parseInput('{"nums":[1],"queries":[[0,0,5]]}'))
})

// Independent oracle: for each prefix, enumerate every achievable decrement vector and look for nums itself.
function oracle({ nums, queries }) {
  const n = nums.length
  let states = new Set([Array(n).fill(0).join(',')])
  for (let k = 0; k <= queries.length; k++) {
    if (states.has(nums.join(','))) return k
    if (k === queries.length) break
    const [l, r, val] = queries[k]
    const next = new Set()
    for (const state of states) {
      const base = state.split(',').map(Number)
      const width = r - l + 1
      const total = (val + 1) ** width
      for (let code = 0; code < total; code++) {
        const d = [...base]
        let rest = code
        for (let b = 0; b < width; b++) { d[l + b] += rest % (val + 1); rest = Math.floor(rest / (val + 1)) }
        next.add(d.join(','))
      }
    }
    states = next
  }
  return -1
}

test('3356 random cases match an exhaustive oracle', () => {
  let seed = 3356
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(3)
    const nums = Array.from({ length: n }, () => rnd(4))
    const queries = Array.from({ length: 1 + rnd(4) }, () => { const l = rnd(n); return [l, l + rnd(n - l), 1 + rnd(2)] })
    const input = { nums, queries }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
