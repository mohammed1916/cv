import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

// Direct simulation of the definition, used only to cross-check the table.
function simulateScore(a) {
  let b = [...a]
  while (b.length > 1) b = b.slice(0, -1).map((v, i) => v ^ b[i + 1])
  return b[0]
}
function bruteBest(nums, l, r) {
  let best = -1
  for (let i = l; i <= r; i++) for (let j = i; j <= r; j++) best = Math.max(best, simulateScore(nums.slice(i, j + 1)))
  return best
}

test('3277 worked examples', () => {
  assert.deepEqual(solve([3, 6, 10, 1], [[0, 1], [1, 3], [0, 3]]), [6, 12, 14])
  assert.deepEqual(solve([4, 4, 9], [[0, 2], [1, 1]]), [13, 4])
})

test('3277 table agrees with direct simulation on small arrays', () => {
  const nums = [5, 1, 9, 12, 3, 7, 0, 6]
  const queries = []
  for (let l = 0; l < nums.length; l++) for (let r = l; r < nums.length; r++) queries.push([l, r])
  const answers = solve(nums, queries)
  queries.forEach(([l, r], k) => assert.equal(answers[k], bruteBest(nums, l, r), `query ${l}..${r}`))
})

test('3277 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[1],"queries":[[1,0]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[0,2]]}'))
})
