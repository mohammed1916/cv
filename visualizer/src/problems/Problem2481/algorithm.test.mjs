import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = n => buildTrace({ n }).result
const PY = python.split('\n')

test('2481 worked examples', () => {
  assert.equal(solve(4), 2)
  assert.equal(solve(3), 3)
})

test('2481 edge case n = 1', () => {
  assert.equal(solve(1), 0)
})

test('2481 frames point at real python lines', () => {
  for (const n of [1, 2, 3]) for (const f of buildTrace({ n }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2481 rejects out of range', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":101}'))
})

// Oracle: a circle cut by k lines is split into at most k(k+1)/2 + 1 pieces... the
// known minimum is found by trying each k and checking that k cuts can give n equal pieces.
// Equal pieces: k lines through the centre give 2k pieces; an odd n needs n lines (each a full diameter).
function oracle(n) {
  if (n === 1) return 0
  for (let k = 0; k <= 100; k++) {
    if (k === 0) continue
    if (n % 2 === 0 && 2 * k >= n && k === n / 2) return k
    if (n % 2 === 1 && k === n) return k
  }
  return -1
}

test('2481 matches an oracle for every n in range', () => {
  for (let n = 1; n <= 100; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})
