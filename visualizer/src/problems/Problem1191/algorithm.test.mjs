import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, phases } from './algorithm.js'

// Independent oracle: materialize k copies and try every contiguous range, including the empty one.
function oracle(arr, k) {
  const big = Array.from({ length: k }, () => arr).flat()
  let best = 0
  for (let l = 0; l < big.length; l++) {
    let sum = 0
    for (let r = l; r < big.length; r++) {
      sum += big[r]
      best = Math.max(best, sum)
    }
  }
  return best
}

test('positive whole-copy total rewards additional copies', () => {
  const arr = [5, -7, 4, 6, -2, 3]
  assert.equal(buildTrace(parseInput(JSON.stringify({ arr, k: 5 }))).result, oracle(arr, 5))
})

test('negative total makes extra copies unhelpful', () => {
  assert.equal(buildTrace({ arr: [4, -12, 3], k: 7 }).result, oracle([4, -12, 3], 7))
})

test('all-negative input allows the empty subarray', () => {
  assert.equal(buildTrace({ arr: [-3, -8, -2], k: 4 }).result, 0)
})

test('one copy has no wraparound', () => {
  assert.equal(buildTrace({ arr: [6, -9, 7], k: 1 }).result, oracle([6, -9, 7], 1))
})

test('random small arrays agree with the materialized oracle for several k', () => {
  let state = 23
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 1 + rand(6) }, () => rand(19) - 9)
    const k = 1 + rand(6)
    assert.equal(buildTrace({ arr, k }).result, oracle(arr, k), JSON.stringify({ arr, k }))
  }
})

test('every frame has a valid phase, code line, message and snapshot', () => {
  const run = buildTrace({ arr: [1, -2, 3], k: 3 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('input validation rejects a zero or non-integer repeat count', () => {
  assert.throws(() => parseInput('{"arr":[1],"k":0}'))
  assert.throws(() => parseInput('{"arr":[1],"k":1.5}'))
})
