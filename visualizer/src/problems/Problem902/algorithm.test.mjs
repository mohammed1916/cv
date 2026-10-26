import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (digits, n) => buildTrace(parseInput(JSON.stringify({ digits, n }))).result
function brute(digits, n) {
  const set = new Set(digits)
  let c = 0
  for (let x = 1; x <= n; x++) if ([...String(x)].every(ch => set.has(ch))) c++
  return c
}
test('official examples', () => {
  assert.equal(solve(['1', '3', '5', '7'], 100), 20)
  assert.equal(solve(['1', '4', '9'], 1000000000), 29523)
  assert.equal(solve(['7'], 8), 1)
})
test('matches brute force', () => {
  let seed = 7
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  for (let t = 0; t < 300; t++) {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].filter(() => rnd(3) === 0)
    if (!digits.length) digits.push('5')
    const n = 1 + rnd(20000)
    assert.equal(solve(digits, n), brute(digits, n))
  }
})
test('last frame is done and rejects bad input', () => {
  const run = buildTrace(parseInput('{"digits":["1"],"n":5}'))
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('{"digits":["3","1"],"n":5}'))
  assert.throws(() => parseInput('{"digits":[],"n":5}'))
  assert.throws(() => parseInput('[1]'))
})
