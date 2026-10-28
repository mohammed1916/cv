import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (steps, arrLen) => buildTrace(parseInput(JSON.stringify({ steps, arr_len: arrLen }))).result

test('1269 hand-checked examples', () => {
  // Four walks of length 3 on two cells return to index 0.
  assert.equal(solve(3, 2), 4)
  // Two walks of length 2 on four cells return to index 0: stay-stay and right-left.
  assert.equal(solve(2, 4), 2)
  // Eight walks of length 4 on two cells return to index 0.
  assert.equal(solve(4, 2), 8)
})

test('1269 rejects out-of-range fields', () => {
  assert.throws(() => parseInput('{"steps":0,"arr_len":2}'))
  assert.throws(() => parseInput('{"steps":3,"arr_len":13}'))
})

// Independent oracle: enumerate every sequence of moves (-1, 0, +1) and count those that stay in bounds and end at 0.
function oracle(steps, arrLen) {
  let count = 0
  const walk = (pos, left) => {
    if (left === 0) { if (pos === 0) count++; return }
    for (const d of [-1, 0, 1]) {
      const next = pos + d
      if (next >= 0 && next < arrLen) walk(next, left - 1)
    }
  }
  walk(0, steps)
  return count
}

test('1269 random cases match the move-sequence oracle', () => {
  let seed = 1269
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const steps = rnd(8) + 1
    const arrLen = rnd(10) + 1
    assert.equal(solve(steps, arrLen), oracle(steps, arrLen), `steps=${steps} arr_len=${arrLen}`)
  }
})
