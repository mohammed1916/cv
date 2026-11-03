import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (target, arr) => buildTrace({ target, arr }).result

test('1460 sample arrays give the expected answers', () => {
  assert.equal(solve([1, 2, 3, 4], [2, 4, 1, 3]), true)
  assert.equal(solve([7, 7], [7, 5]), false)
  assert.equal(solve([3], [3]), true)
  assert.equal(solve([1, 1, 2], [1, 2, 2]), false)
})

test('1460 order does not matter but multiplicity does', () => {
  assert.equal(solve([5, 1, 5, 2], [2, 5, 5, 1]), true)
  assert.equal(solve([5, 1, 5, 2], [2, 5, 1, 1]), false)
})

test('1460 the trace reports the first mismatched value', () => {
  const { frames, result } = buildTrace({ target: [4, 4], arr: [4, 9] })
  assert.equal(result, false)
  assert.deepEqual(frames.at(-2).snapshot.mismatch, { value: 4, count: 1 })
  assert.equal(frames.at(-1).phase, 'done')
})

test('1460 rejects malformed input', () => {
  assert.throws(() => parseInput('[1]'), /object/)
  assert.throws(() => parseInput('{"target":[1,2],"arr":[1]}'), /same length/)
  assert.throws(() => parseInput('{"target":[0],"arr":[1]}'), /target/)
  assert.throws(() => parseInput('{"target":[1],"arr":[21]}'), /arr/)
})

// Independent oracle: sorted arrays are equal exactly when the multisets are equal.
test('1460 random arrays match a sorted-comparison oracle', () => {
  let seed = 9
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(8)
    const target = Array.from({ length: len }, () => 1 + rnd(4))
    const arr = target.map(v => v)
    for (let i = len - 1; i > 0; i--) { const j = rnd(i + 1); [arr[i], arr[j]] = [arr[j], arr[i]] }
    if (rnd(2)) arr[rnd(len)] = 1 + rnd(4)
    const expected = JSON.stringify([...target].sort((a, b) => a - b)) === JSON.stringify([...arr].sort((a, b) => a - b))
    assert.equal(solve(target, arr), expected, JSON.stringify({ target, arr }))
  }
})
