import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = arr => buildTrace({ arr }).result

function lessThan(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]
  return false
}

// Independent oracle: try every single swap and keep the largest arrangement that is still smaller.
function oracle(arr) {
  let best = null
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      const next = [...arr];
      [next[i], next[j]] = [next[j], next[i]]
      if (lessThan(next, arr) && (best === null || lessThan(best, next))) best = next
    }
  }
  return best ?? [...arr]
}

test('authored samples', () => {
  assert.deepEqual(solve([7, 4, 9, 6, 8, 5, 3, 3, 4]), oracle([7, 4, 9, 6, 8, 5, 3, 3, 4]))
  assert.deepEqual(solve([8, 3, 3, 6, 6]), [6, 3, 3, 8, 6])
  assert.deepEqual(solve([1, 2, 2, 4, 7]), [1, 2, 2, 4, 7])
  assert.deepEqual(solve([9]), [9])
})

test('leftmost duplicate keeps the suffix as large as possible', () => {
  assert.deepEqual(solve([3, 5, 2, 2, 4]), [3, 4, 2, 2, 5])
  assert.deepEqual(oracle([3, 5, 2, 2, 4]), [3, 4, 2, 2, 5])
})

test('random arrays agree with the all-swaps oracle', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 800; t++) {
    const n = 1 + rand(8)
    const arr = Array.from({ length: n }, () => 1 + rand(6))
    assert.deepEqual(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})

test('the input is never modified', () => {
  const input = [8, 3, 3, 6, 6]
  buildTrace({ arr: input })
  assert.deepEqual(input, [8, 3, 3, 6, 6])
})

test('parser rejects malformed input', () => {
  assert.throws(() => parseInput('{"arr":[]}'), /1 to 40/)
  assert.throws(() => parseInput('{"arr":[0]}'), /1 to 100/)
  assert.throws(() => parseInput('[1]'), /arr array/)
})

test('every frame names a phase, a code line and a message; the last frame is done', () => {
  const run = buildTrace({ arr: [7, 4, 9, 6, 8, 5, 3, 3, 4] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(code.length, python.split('\n').length)
})
