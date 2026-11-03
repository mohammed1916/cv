import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(n).result

// Independent oracle: build the full binary string with BigInt and reduce at the end.
function oracle(n) {
  let bits = ''
  for (let i = 1; i <= n; i++) bits += i.toString(2)
  return Number(BigInt('0b' + bits) % 1000000007n)
}

test('1680 small concatenations are correct by hand', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(2), 6)   // "1" + "10" = "110"
  assert.equal(solve(4), 220) // "1" + "10" + "11" + "100" = "11011100"
})

test('1680 every n up to 60 matches the BigInt oracle', () => {
  for (let n = 1; n <= 60; n++) assert.equal(solve(n), oracle(n), `n = ${n}`)
})

test('1680 input must be a whole number within the visualizer limit', () => {
  assert.equal(parseInput('12'), 12)
  assert.throws(() => parseInput('0'), /1 to 60/)
  assert.throws(() => parseInput('61'), /1 to 60/)
  assert.throws(() => parseInput('2.5'), /1 to 60/)
})

test('1680 the width grows exactly at powers of two', () => {
  const run = buildTrace(9)
  const grows = run.frames.filter(f => f.phase === 'grow').map(f => f.snapshot.i)
  assert.deepEqual(grows, [1, 2, 4, 8])
  assert.equal(run.frames.at(-1).phase, 'done')
})
