import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3653 official examples', () => {
  assert.equal(solve('{"nums":[1,1,1],"queries":[[0,2,1,4]]}'), 4)
  assert.equal(solve('{"nums":[2,3,1,5,4],"queries":[[1,4,2,3],[0,2,1,2]]}'), 31)
})

test('3653 rejects a step of zero', () => {
  assert.throws(() => parseInput('{"nums":[1],"queries":[[0,0,0,2]]}'))
})

// Independent oracle: for each index, apply the matching queries to that index alone, then XOR the results.
function oracle({ nums, queries }) {
  const MOD = 1000000007n
  let answer = 0n
  nums.forEach((start, idx) => {
    let value = BigInt(start)
    for (const [l, r, k, v] of queries) {
      if (idx >= l && idx <= r && (idx - l) % k === 0) value = (value * BigInt(v)) % MOD
    }
    answer ^= value
  })
  return Number(answer)
}

test('3653 seeded random cases match the per-index oracle', () => {
  let seed = 3653
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const nums = Array.from({ length: n }, () => 1 + rnd(100))
    const queries = Array.from({ length: 1 + rnd(8) }, () => {
      const l = rnd(n)
      const r = l + rnd(n - l)
      return [l, r, 1 + rnd(n), 1 + rnd(100)]
    })
    const input = { nums, queries }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
