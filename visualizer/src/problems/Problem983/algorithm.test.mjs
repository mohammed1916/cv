import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: recurse over the list of travel days. Each step buys one pass that starts on the
// first uncovered travel day and skips every travel day that pass covers.
function recursiveCost(days, [one, seven, thirty]) {
  const memo = new Map()
  const solve = i => {
    if (i >= days.length) return 0
    if (memo.has(i)) return memo.get(i)
    const start = days[i]
    const after = length => {
      let j = i
      while (j < days.length && days[j] < start + length) j++
      return j
    }
    const result = Math.min(
      one + solve(after(1)),
      seven + solve(after(7)),
      thirty + solve(after(30)),
    )
    memo.set(i, result)
    return result
  }
  return solve(0)
}

test('983 minimum ticket cost matches the recursive oracle', () => {
  const cases = [
    { days: [1, 4, 6, 7, 8, 20], costs: [2, 7, 15] },
    { days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 31], costs: [2, 7, 15] },
    { days: [2], costs: [5, 3, 1] },
    { days: [1, 10, 25, 40, 55], costs: [4, 9, 20] },
    { days: [3, 5, 9, 15, 22, 36, 37, 38, 59, 60], costs: [3, 10, 12] },
    { days: [1, 8, 15, 22, 29], costs: [2, 7, 4] },
  ]
  for (const input of cases) {
    const run = buildTrace(parseInput(JSON.stringify(input)))
    assert.equal(run.result, recursiveCost(input.days, input.costs), JSON.stringify(input))
  }
})

test('983 rejects days that are not increasing', () => {
  assert.throws(() => parseInput('{"days":[4,2],"costs":[2,7,15]}'))
})
