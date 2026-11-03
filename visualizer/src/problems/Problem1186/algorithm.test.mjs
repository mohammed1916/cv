import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

// Independent oracle: every nonempty subarray, with no deletion or one deleted element
// that still leaves at least one value.
function oracle(arr) {
  let best = -Infinity
  for (let l = 0; l < arr.length; l++) {
    let sum = 0
    for (let r = l; r < arr.length; r++) {
      sum += arr[r]
      best = Math.max(best, sum)
      if (r > l) for (let d = l; d <= r; d++) best = Math.max(best, sum - arr[d])
    }
  }
  return best
}

test('one large loss is deleted from a profitable run', () => {
  const arr = [4, -2, 7, -15, 6, 3, -1, 8, -4]
  assert.equal(buildTrace(parseInput(JSON.stringify({ arr }))).result, oracle(arr))
})

test('all-negative input keeps exactly one element, and a lone negative cannot vanish', () => {
  assert.equal(buildTrace({ arr: [-9, -3, -7, -5] }).result, -3)
  assert.equal(buildTrace({ arr: [-11] }).result, -11)
})

test('random arrays agree with the brute-force oracle', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const arr = Array.from({ length: 1 + rand(9) }, () => rand(21) - 10)
    assert.equal(buildTrace({ arr }).result, oracle(arr), JSON.stringify(arr))
  }
})

test('every frame has a valid phase, code line, message and snapshot', () => {
  const run = buildTrace({ arr: [2, -1, 3] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(python.split('\n').length >= 1, true)
})

test('input validation rejects non-integers', () => {
  assert.throws(() => parseInput('{"arr":[1.5]}'))
  assert.throws(() => parseInput('{"arr":[]}'))
})
