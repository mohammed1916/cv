import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1589 statement examples', () => {
  assert.equal(solve({ nums: [1, 2, 3, 4, 5], requests: [[1, 3], [0, 1]] }), 19)
  assert.equal(solve({ nums: [1, 2, 3, 4, 5, 6], requests: [[0, 1]] }), 11)
  assert.equal(solve({ nums: [1, 2, 3, 4, 5, 10], requests: [[0, 2], [1, 3], [1, 1]] }), 47)
})

test('1589 rejects a request outside the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"requests":[[0,2]]}'))
})

// Independent oracle: try every permutation of nums and keep the best total.
function permutations(items) {
  if (items.length <= 1) return [items]
  const out = []
  items.forEach((item, i) => {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const tail of permutations(rest)) out.push([item, ...tail])
  })
  return out
}

function oracle({ nums, requests }) {
  let best = 0
  for (const perm of permutations(nums)) {
    let total = 0
    for (const [s, e] of requests) for (let i = s; i <= e; i++) total += perm[i]
    best = Math.max(best, total)
  }
  return best % 1000000007
}

test('1589 random cases match a permutation oracle', () => {
  let seed = 1589
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const nums = Array.from({ length: n }, () => rnd(100))
    const requests = Array.from({ length: 1 + rnd(5) }, () => { const s = rnd(n); return [s, s + rnd(n - s)] })
    const input = { nums, requests }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
