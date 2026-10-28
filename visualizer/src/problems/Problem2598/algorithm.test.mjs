import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2598 official examples', () => {
  assert.equal(solve('{"nums":[1,-10,7,13,6,8],"value":5}'), 4)
  assert.equal(solve('{"nums":[1,-10,7,13,6,8],"value":7}'), 2)
})

test('2598 an empty residue class stops the count at its first value', () => {
  // Three zeros can only cover target 0 when value is 3: targets 1 and 2 need residues 1 and 2, which are empty.
  assert.equal(solve('{"nums":[0,0,0],"value":3}'), 1)
  assert.equal(solve('{"nums":[0,0,0],"value":2}'), 1)
  assert.equal(solve('{"nums":[0,1,5],"value":3}'), 3)
})

test('2598 rejects a value of zero', () => {
  assert.throws(() => parseInput('{"nums":[1],"value":0}'))
})

// Independent oracle: for each target count k, match targets 0..k-1 to numbers (Kuhn's bipartite matching).
function matchable(nums, value, k) {
  const owner = new Array(nums.length).fill(-1)
  const canTake = (x, t) => ((((x - t) % value) + value) % value) === 0
  const place = (t, seen) => {
    for (let i = 0; i < nums.length; i++) {
      if (seen[i] || !canTake(nums[i], t)) continue
      seen[i] = true
      if (owner[i] === -1 || place(owner[i], seen)) {
        owner[i] = t
        return true
      }
    }
    return false
  }
  for (let t = 0; t < k; t++) if (!place(t, new Array(nums.length).fill(false))) return false
  return true
}

function oracle(nums, value) {
  let k = 0
  while (matchable(nums, value, k + 1)) k++
  return k
}

test('2598 random inputs match a bipartite-matching oracle', () => {
  let seed = 2598
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 250; round++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(21) - 10)
    const value = 1 + rnd(5)
    assert.equal(solve(JSON.stringify({ nums, value })), oracle(nums, value), JSON.stringify({ nums, value }))
  }
})
