import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (code, k) => buildTrace({ code, k }).result

// Independent oracle: literal reading of each position's neighbourhood, with explicit modular wrap-around.
function oracle(code, k) {
  const n = code.length
  const out = []
  for (let i = 0; i < n; i++) {
    let total = 0
    if (k > 0) for (let step = 1; step <= k; step++) total += code[(i + step) % n]
    if (k < 0) for (let step = 1; step <= -k; step++) total += code[((i - step) % n + n) % n]
    out.push(total)
  }
  return out
}

test('1652 hand-checked arrays for positive, zero and negative k', () => {
  assert.deepEqual(solve([6, 1, 3, 8], 2), [4, 11, 14, 7])
  assert.deepEqual(solve([2, 9, 4], -1), [4, 2, 9])
  assert.deepEqual(solve([1, 5, 2, 7], 0), [0, 0, 0, 0])
  assert.deepEqual(solve([7], 0), [0])
})

test('1652 random arrays match the independent oracle', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(9)
    const code = Array.from({ length: n }, () => rnd(201) - 100)
    const k = rnd(2 * n - 1) - (n - 1)
    assert.deepEqual(solve(code, k), oracle(code, k), JSON.stringify({ code, k }))
  }
})

test('1652 windows never include the reading position itself', () => {
  const { frames } = buildTrace({ code: [5, 6, 7, 8, 9], k: 3 })
  for (const frame of frames) {
    if (frame.snapshot.index !== null && frame.snapshot.window) {
      assert.ok(!frame.snapshot.window.includes(frame.snapshot.index))
    }
  }
})

test('1652 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"code":[1,2],"k":2}'), /k/)
  assert.throws(() => parseInput('{"code":[],"k":0}'), /code/)
  assert.throws(() => parseInput('{"code":[1,200],"k":0}'), /code/)
})
