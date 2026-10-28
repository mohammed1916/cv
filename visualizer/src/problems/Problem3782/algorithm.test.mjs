import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('3782 official examples', () => {
  assert.equal(solve(8), 3)
  assert.equal(solve(5), 1)
  assert.equal(solve(1), 1)
})

test('3782 edge case: two values, the first operation keeps the left one', () => {
  assert.equal(solve(2), 1)
})

test('3782 rejects n of zero', () => {
  assert.throws(() => parseInput('{"n":0}'))
})

// Independent oracle: count the sizes round by round, then trace the final survivor back to its original position.
function oracle(n) {
  const ops = []
  let len = n
  let op = 1
  while (len > 1) {
    ops.push([op, len])
    len = Math.ceil(len / 2)
    op = op === 1 ? 2 : 1
  }
  let j = 0
  for (let r = ops.length - 1; r >= 0; r--) {
    const [o, size] = ops[r]
    const m = Math.ceil(size / 2)
    j = o === 1 ? 2 * j : (size - 1) - 2 * (m - 1 - j)
  }
  return j + 1
}

test('3782 every n up to 200 matches the reverse-tracing oracle', () => {
  for (let n = 1; n <= 200; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})
