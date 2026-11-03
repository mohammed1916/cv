import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every way to delete exactly k positions and keep the smallest distinct count.
function brute(arr, k) {
  let best = Infinity
  for (let mask = 0; mask < 1 << arr.length; mask++) {
    let bits = 0
    for (let i = 0; i < arr.length; i++) if (mask & (1 << i)) bits++
    if (bits !== k) continue
    const kept = new Set(arr.filter((_, i) => !(mask & (1 << i))))
    best = Math.min(best, kept.size)
  }
  return best
}

test('sample and small hand-checked cases', () => {
  assert.equal(buildTrace({ arr: [7, 7, 8, 9, 9, 9, 10, 10], k: 4 }).result, 2)
  assert.equal(buildTrace({ arr: [1, 2, 3, 4], k: 2 }).result, 2)
  assert.equal(buildTrace({ arr: [5, 5, 5], k: 3 }).result, 0)
  assert.equal(buildTrace({ arr: [5, 5, 4], k: 0 }).result, 2)
})

test('random small arrays agree with brute-force deletion', () => {
  let state = 21
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rand(8)
    const arr = Array.from({ length: n }, () => 1 + rand(5))
    const k = rand(n + 1)
    assert.equal(buildTrace({ arr, k }).result, brute(arr, k), JSON.stringify({ arr, k }))
  }
})

test('frames finish with done and every removal decision is recorded', () => {
  const run = buildTrace({ arr: [4, 4, 1, 2, 2, 2], k: 3 })
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).scene.distinct, run.result)
  assert.ok(run.frames.some(f => f.phase === 'remove' || f.phase === 'stop'))
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 10)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"arr":[],"k":0}'), /1 to 60/)
  assert.throws(() => parseInput('{"arr":[1,2],"k":3}'), /from 0 to 2/)
  assert.throws(() => parseInput('{"arr":[1.5],"k":0}'), /integer/)
})
