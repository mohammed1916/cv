import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const rot = { 0: '0', 1: '1', 8: '8', 2: '5', 5: '2', 6: '9', 9: '6' }
const oracle = n => {
  let c = 0
  for (let x = 1; x <= n; x++) {
    const s = String(x)
    if ([...s].every(d => d in rot) && [...s].map(d => rot[d]).join('') !== s) c++
  }
  return c
}
test('official examples', () => {
  assert.equal(buildTrace(10).result, 4)
  assert.equal(buildTrace(1).result, 0)
  assert.equal(buildTrace(2).result, 1)
})
test('matches string-rotation oracle for every n up to 1000', () => {
  const run = buildTrace(1000)
  for (let n = 1; n <= 1000; n++) assert.equal(run.frames[n].count, oracle(n))
  assert.equal(run.result, oracle(1000))
  assert.equal(run.frames.at(-1).phase, 'done')
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('"5"'))
  assert.throws(() => parseInput('5000'))
})
