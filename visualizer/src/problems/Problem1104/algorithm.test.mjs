import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = label => buildTrace(parseInput(JSON.stringify({ label }))).result

test('1104 official examples', () => {
  assert.deepEqual(solve(14), [1, 3, 4, 14])
  assert.deepEqual(solve(26), [1, 2, 6, 10, 26])
})

test('1104 edge cases', () => {
  assert.deepEqual(solve(1), [1])
  assert.deepEqual(solve(2), [1, 2])
  assert.deepEqual(solve(3), [1, 3])
})

test('1104 rejects labels out of range', () => {
  assert.throws(() => parseInput('{"label":0}'))
  assert.throws(() => parseInput('{"label":1000001}'))
})

// Independent oracle: lay out every row by visual position, then walk parents by position halving.
const labelAt = (r, j) => (r % 2 === 0 ? 2 ** r + j : 2 ** (r + 1) - 1 - j)
const where = new Map()
for (let r = 0; r <= 10; r++) for (let j = 0; j < 2 ** r; j++) where.set(labelAt(r, j), [r, j])

function oracle(label) {
  let [r, j] = where.get(label)
  const path = []
  for (;;) {
    path.push(labelAt(r, j))
    if (r === 0) break
    r -= 1
    j = Math.floor(j / 2)
  }
  return path.reverse()
}

test('1104 seeded random labels match a visual-position oracle', () => {
  let seed = 1104
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const label = 1 + rnd(2047)
    assert.deepEqual(solve(label), oracle(label), String(label))
  }
})
