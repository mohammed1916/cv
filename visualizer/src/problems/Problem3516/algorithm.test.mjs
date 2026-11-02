import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (x, y, z) => buildTrace({ x, y, z }).result

test('3516 worked examples', () => {
  assert.equal(solve(2, 7, 4), 1)
  assert.equal(solve(2, 5, 6), 2)
  assert.equal(solve(1, 5, 3), 0)
})

test('3516 people on the same side and identical positions', () => {
  assert.equal(solve(4, 4, 4), 0)
  assert.equal(solve(1, 1, 100), 0)
  assert.equal(solve(3, 9, 3), 1)
  assert.equal(solve(9, 3, 3), 2)
})

test('3516 rejects values outside 1 to 100', () => {
  assert.throws(() => parseInput('{"x":0,"y":1,"z":2}'))
  assert.throws(() => parseInput('{"x":1,"y":1.5,"z":2}'))
})

// Independent oracle: walk both people one step at a time toward z and record who arrives first.
function oracle(x, y, z) {
  let a = x, b = y, t = 0
  while (true) {
    if (a === z && b === z) return 0
    if (a === z) return 1
    if (b === z) return 2
    if (a !== z) a += Math.sign(z - a)
    if (b !== z) b += Math.sign(z - b)
    t++
  }
}

test('3516 exhaustive small grid matches a step-by-step oracle', () => {
  for (let x = 1; x <= 12; x++) for (let y = 1; y <= 12; y++) for (let z = 1; z <= 12; z++) {
    assert.equal(solve(x, y, z), oracle(x, y, z), JSON.stringify({ x, y, z }))
  }
})
