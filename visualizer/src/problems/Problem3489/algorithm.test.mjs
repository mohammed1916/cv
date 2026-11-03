import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('3489 hand-checked cases', () => {
  assert.equal(solve([1, 0, 1], [[0, 2, 1], [2, 2, 2]]), 1)
  assert.equal(solve([5, 2, 2], [[0, 2, 1]]), -1)
  // After two queries index 0 can reach 3 (1 + 2), but index 1 has no covering query yet.
  // The third query covers index 1 with val 1, so the first working prefix is 3.
  assert.equal(solve([3, 1], [[0, 0, 1], [0, 0, 2], [1, 1, 1]]), 3)
})

test('3489 an already zero array needs no queries', () => {
  assert.equal(solve([0, 0], [[0, 1, 4]]), 0)
})

test('3489 the final trace frame reports the result', () => {
  const trace = buildTrace({ nums: [1, 0, 1], queries: [[0, 2, 1], [2, 2, 2]] })
  assert.equal(trace.frames.at(-1).k, trace.result)
})

test('3489 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[1],"queries":[[0,1,1]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[0,0,0]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[1,0,1]]}'))
})

// Independent oracle: brute force over every subset of the first k queries for every index.
function oracle(nums, queries) {
  if (nums.every(x => x === 0)) return 0
  for (let k = 1; k <= queries.length; k++) {
    let allOk = true
    for (let i = 0; i < nums.length && allOk; i++) {
      const covering = queries.slice(0, k).filter(([l, r]) => l <= i && i <= r).map(([, , v]) => v)
      let reachable = false
      for (let mask = 0; mask < 1 << covering.length && !reachable; mask++) {
        let sum = 0
        covering.forEach((v, bit) => { if (mask & (1 << bit)) sum += v })
        if (sum === nums[i]) reachable = true
      }
      allOk = reachable
    }
    if (allOk) return k
  }
  return -1
}

test('3489 agrees with a subset oracle on random inputs', () => {
  let s = 3489
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
  const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))
  for (let t = 0; t < 300; t++) {
    const n = int(1, 5)
    const nums = Array.from({ length: n }, () => int(0, 8))
    const q = int(1, 6)
    const queries = Array.from({ length: q }, () => {
      const l = int(0, n - 1)
      const r = int(l, n - 1)
      return [l, r, int(1, 4)]
    })
    assert.equal(solve(nums, queries), oracle(nums, queries))
  }
})
