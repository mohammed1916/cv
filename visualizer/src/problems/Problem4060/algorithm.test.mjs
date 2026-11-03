import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (l, r) => buildTrace({ l, r }).result

test('4060 hand-checked ranges', () => {
  // 1 to 10: the odd numbers 1, 3, 5, 7, 9 have no even digits; 10 has one even digit, so it fails.
  assert.equal(solve(1, 10), 5)
  assert.equal(solve(7, 7), 1)
  assert.equal(solve(2, 2), 0)
  assert.equal(solve(1, 1), 1)
})

test('4060 rejects bad input', () => {
  assert.throws(() => parseInput('{"l":0,"r":5}'))
  assert.throws(() => parseInput('{"l":6,"r":5}'))
})

// Oracle: test every integer directly in the range.
function oracle(l, r) {
  let count = 0
  for (let x = l; x <= r; x++) {
    const evens = String(x).split('').filter(d => Number(d) % 2 === 0).length
    if (evens % 2 === 0) count++
  }
  return count
}

test('4060 ranges up to 3000 match direct counting', () => {
  let seed = 4060
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const l = 1 + rnd(3000)
    const r = l + rnd(3000 - l + 1)
    assert.equal(solve(l, r), oracle(l, r), `${l}..${r}`)
  }
})

test('4060 large bound runs and returns a non-negative count', () => {
  const run = buildTrace({ l: 1, r: 1000000000000 })
  assert.ok(run.result > 0 && run.result <= 1000000000000)
  assert.equal(run.frames.at(-1).phase, 'done')
})
