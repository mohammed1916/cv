import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('660 small values and the first wrap', () => {
  assert.equal(buildTrace({ n: 8 }).result, 8)
  assert.equal(buildTrace({ n: 9 }).result, 10)
  assert.equal(buildTrace({ n: 10 }).result, 11)
})

test('660 rejects n below 1', () => {
  assert.throws(() => parseInput('{"n":0}'))
})

// Independent oracle: count integers one at a time and skip any that contain a 9.
function oracle(n) {
  let count = 0
  for (let x = 1; ; x++) {
    if (!String(x).includes('9')) count++
    if (count === n) return x
  }
}

test('660 every n up to 3000 matches a count-and-skip oracle', () => {
  for (let n = 1; n <= 3000; n++) assert.equal(buildTrace({ n }).result, oracle(n), `n=${n}`)
})
