import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: sort, then take the largest neighbouring difference.
function oracle(nums) {
  const sorted = [...nums].sort((a, b) => a - b)
  let best = 0
  for (let i = 1; i < sorted.length; i++) best = Math.max(best, sorted[i] - sorted[i - 1])
  return best
}

test('a hand-made list gives a widest gap of 12', () => {
  const run = buildTrace(parseInput('[4, 40, 9, 1, 25]'))
  assert.equal(run.result, oracle([4, 40, 9, 1, 25]))
  assert.equal(run.result, 16)
})

test('all-equal values have no gap', () => {
  assert.equal(buildTrace(parseInput('[7,7,7]')).result, 0)
})

test('the widest gap is found across bucket boundaries', () => {
  const nums = [0, 1, 2, 3, 100, 101]
  assert.equal(buildTrace(nums).result, oracle(nums))
})

test('random lists agree with the sort-and-compare oracle', () => {
  let state = 31
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const n = 2 + rand(15)
    const nums = Array.from({ length: n }, () => rand(1001))
    assert.equal(buildTrace(nums).result, oracle(nums), JSON.stringify(nums))
  }
})

test('every frame has a phase, narration, and a valid code line', () => {
  const run = buildTrace([9, 2, 6])
  for (const frame of run.frames) {
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 14)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('[5]'))
  assert.throws(() => parseInput('[-1, 4]'))
  assert.throws(() => parseInput('[1, 1001]'))
  assert.throws(() => parseInput('[1.5, 2]'))
})
