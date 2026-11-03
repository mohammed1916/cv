import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (sensor1, sensor2) => buildTrace({ sensor1, sensor2 }).result

test('1826 worked examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5], [1, 2, 4, 5, 6]), 2)
  assert.equal(solve([4, 2, 8, 1], [4, 9, 2, 8]), 1)
  assert.equal(solve([7, 7, 7], [7, 7, 7]), -1)
  assert.equal(solve([5, 6, 7], [1, 2, 3]), -1)
})

test('1826 edge cases: two values and a drop at the very end', () => {
  assert.equal(solve([3, 9], [3, 5]), -1)
  assert.equal(solve([3, 9], [9, 0]), 2)
  assert.equal(solve([9, 0], [3, 9]), 1)
  assert.equal(solve([1, 2], [2, 3]), 2)
})

test('1826 rejects malformed readings', () => {
  assert.throws(() => parseInput('{"sensor1":[1],"sensor2":[1]}'))
  assert.throws(() => parseInput('{"sensor1":[1,2],"sensor2":[1,2,3]}'))
  assert.throws(() => parseInput('{"sensor1":[1,-2],"sensor2":[1,2]}'))
})

// Independent oracle: sensor A is consistent with original B when deleting one index of B
// and appending any value gives A. Only the first n-1 entries of A are constrained.
function consistent(faulty, original) {
  const n = faulty.length
  for (let j = 0; j < n; j++) {
    const removed = [...original.slice(0, j), ...original.slice(j + 1)]
    if (removed.every((v, i) => v === faulty[i])) return true
  }
  return false
}
function oracle(sensor1, sensor2) {
  const fits = []
  if (consistent(sensor1, sensor2)) fits.push(1)
  if (consistent(sensor2, sensor1)) fits.push(2)
  return fits.length === 1 ? fits[0] : -1
}

test('1826 random readings match the deletion oracle', () => {
  let seed = 1826
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 1500; t++) {
    const n = 2 + rnd(5)
    const original = Array.from({ length: n }, () => rnd(3))
    let other = original
    if (rnd(2)) {
      const j = rnd(n)
      other = [...original.slice(0, j), ...original.slice(j + 1), rnd(3)]
    }
    const sensor1 = rnd(2) ? original : other
    const sensor2 = sensor1 === original ? other : original
    assert.equal(solve(sensor1, sensor2), oracle(sensor1, sensor2), JSON.stringify({ sensor1, sensor2 }))
  }
})

test('1826 frames carry valid pseudocode and python lines and sane state', () => {
  const run = buildTrace({ sensor1: [1, 2, 3, 4, 5], sensor2: [1, 2, 4, 5, 6] })
  const pyLines = python.trim().split('\n').length
  assert.ok(run.frames.length > 5)
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
    assert.ok(f.message.length > 0)
    if (f.cells) assert.equal(f.cells.length, 5)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
