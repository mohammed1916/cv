import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const solve = (arr, difference) => buildTrace({ arr, difference }).result

// Independent oracle: pairwise chain DP over indices, O(n^2).
function oracle(arr, difference) {
  const dp = []
  for (let j = 0; j < arr.length; j++) {
    let best = 1
    for (let i = 0; i < j; i++) if (arr[j] - arr[i] === difference) best = Math.max(best, dp[i] + 1)
    dp.push(best)
  }
  return Math.max(0, ...dp)
}

test('worked examples', () => {
  assert.equal(solve([7, 1, 5, 3, 9, 11, 13, 4], 2), 4)
  assert.equal(solve([2, 2, 2, 5], 0), 3)
  assert.equal(solve([1, 4, 9], 2), 1)
})

test('random arrays agree with the pairwise oracle', () => {
  let state = 13
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const arr = Array.from({ length: 1 + rand(12) }, () => rand(21) - 10)
    const difference = rand(11) - 5
    assert.equal(solve(arr, difference), oracle(arr, difference), JSON.stringify({ arr, difference }))
  }
})

test('parser rejects bad sizes and difference', () => {
  assert.throws(() => parseInput('{"arr":[],"difference":1}'), /1 to 12/)
  assert.throws(() => parseInput('{"arr":[11],"difference":1}'), /-10 to 10/)
  assert.throws(() => parseInput('{"arr":[1],"difference":6}'), /-5 to 5/)
  assert.deepEqual(parseInput('{"arr":[1,2],"difference":-1}'), { arr: [1, 2], difference: -1 })
})

test('every frame has a known phase, narration and a line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ arr: [7, 1, 5, 3, 9, 11, 13, 4], difference: 2 })
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
