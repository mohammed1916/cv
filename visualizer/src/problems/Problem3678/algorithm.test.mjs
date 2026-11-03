import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result
const oracle = nums => {
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length
  for (let x = 1; ; x++) if (x > avg && !nums.includes(x)) return x
}

test('3678 invented examples', () => {
  assert.equal(solve('[7,2,9]'), 8)
  assert.equal(solve('[-4,1,1]'), 2)
})

test('3678 matches a brute-force oracle and labels every frame', () => {
  for (const nums of [[1], [1, 2, 3], [-100, 100], [5, 6, 7, 8], [-3, -2, 1, 4]]) {
    assert.equal(solve(JSON.stringify(nums)), oracle(nums))
  }
  for (const f of buildTrace(parseInput('[7,2,9]')).frames) assert.ok(f.pythonLine > 0)
})
