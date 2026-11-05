import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result
// Exhaustive search: each week pick a project with milestones left that differs from last week's project.
const brute = arr => {
  const memo = new Map()
  const go = (counts, last) => {
    const key = counts.join(',') + '|' + last
    if (memo.has(key)) return memo.get(key)
    let best = 0
    counts.forEach((c, i) => {
      if (c > 0 && i !== last) {
        counts[i]--
        best = Math.max(best, 1 + go(counts, i))
        counts[i]++
      }
    })
    memo.set(key, best)
    return best
  }
  return go([...arr], -1)
}

test('1953 invented projects', () => {
  assert.equal(solve([4, 1, 1]), 5)
  assert.equal(solve([1, 2, 3]), 6)
})

test('1953 matches exhaustive search on small inputs', () => {
  const cases = [[1], [2], [3, 1], [5, 2, 1], [2, 2, 2], [4, 1, 2], [6, 1, 1, 1], [3, 3, 1]]
  for (const c of cases) assert.equal(solve(c), brute(c), JSON.stringify(c))
})
