import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = friendship => buildTrace(parseInput(JSON.stringify({ friendship }))).result
// Check every pair of users against the full friend sets.
const brute = friendship => {
  const users = [...new Set(friendship.flat())]
  const friends = u => new Set(friendship.flatMap(([a, b]) => (a === u ? [b] : b === u ? [a] : [])))
  const out = []
  for (const [a, b] of friendship) {
    const common = [...friends(a)].filter(f => friends(b).has(f)).length
    if (common >= 3) out.push([a, b, common])
  }
  return out.sort((x, y) => x[0] - y[0] || x[1] - y[1])
}

test('1949 invented friendships', () => {
  assert.deepEqual(solve([[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [2, 5], [3, 4], [3, 5], [4, 5]]), [[2, 3, 3], [2, 4, 3], [3, 4, 3]])
})

test('1949 matches set-based check', () => {
  const cases = [
    [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [2, 5], [3, 4], [3, 5], [4, 5]],
    [[1, 2], [1, 3], [2, 3], [2, 4], [3, 4]],
    [[1, 5], [2, 5], [3, 5], [4, 5], [1, 2], [2, 3], [3, 4]],
  ]
  for (const c of cases) assert.deepEqual(solve(c), brute(c), JSON.stringify(c))
})
