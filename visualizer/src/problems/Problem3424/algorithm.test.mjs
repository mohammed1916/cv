import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr, brr, k) => buildTrace({ arr, brr, k }).result

test('3424 a worked case uses one split plus sorted pairing', () => {
  assert.equal(solve([-7, 9, 5], [7, -2, -5], 2), 13)
})

test('3424 equal arrays cost nothing', () => {
  assert.equal(solve([2, 1], [2, 1], 0), 0)
  assert.equal(solve([5, 5], [5, 5], 3), 0)
})

test('3424 direct adjustment wins when a split is expensive', () => {
  assert.equal(solve([1, 10], [2, 9], 100), 2)
})

test('3424 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"arr":[1],"brr":[1,2],"k":0}'))
})

// Independent oracle: try every permutation, pay k once if any permutation is used.
function permutations(xs) {
  if (xs.length <= 1) return [xs]
  const out = []
  xs.forEach((x, i) => {
    for (const rest of permutations([...xs.slice(0, i), ...xs.slice(i + 1)])) out.push([x, ...rest])
  })
  return out
}

test('3424 agrees with a permutation oracle on small inputs', () => {
  const cases = [
    [[3, -1, 4], [0, 2, 6], 5],
    [[1, 1, 9, -4], [2, -3, 1, 7], 2],
    [[10, 0], [0, 10], 1],
    [[-5, 6, 2], [2, -5, 6], 40],
  ]
  for (const [arr, brr, k] of cases) {
    let best = Infinity
    const direct = arr.reduce((s, x, i) => s + Math.abs(x - brr[i]), 0)
    for (const p of permutations(arr)) best = Math.min(best, k + p.reduce((s, x, i) => s + Math.abs(x - brr[i]), 0))
    assert.equal(solve(arr, brr, k), Math.min(direct, best))
  }
})
