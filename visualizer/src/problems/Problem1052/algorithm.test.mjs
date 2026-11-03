import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (customers, grumpy, minutes) => buildTrace({ customers, grumpy, minutes }).result

// Independent oracle: try every contiguous window of the given length.
function oracle(customers, grumpy, minutes) {
  let calm = 0
  customers.forEach((c, i) => { if (grumpy[i] === 0) calm += c })
  let best = 0
  for (let s = 0; s + minutes <= customers.length; s++) {
    let total = 0
    for (let i = s; i < s + minutes; i++) if (grumpy[i] === 1) total += customers[i]
    best = Math.max(best, total)
  }
  return calm + best
}

test('first authored sample: calm 22 plus a best window of 25', () => {
  const customers = [4, 9, 2, 7, 5, 8, 3, 11, 6, 4, 10, 2]
  const grumpy = [0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0]
  assert.equal(solve(customers, grumpy, 4), 47)
  assert.equal(oracle(customers, grumpy, 4), 47)
})

test('edge cases: no grumpy minutes, full-length window, zero-customer minutes', () => {
  assert.equal(solve([3, 7, 4, 9], [0, 0, 0, 0], 2), 23)
  assert.equal(solve([6, 2, 8, 4], [1, 0, 1, 1], 4), 20)
  assert.equal(solve([0, 5, 0, 7, 0], [1, 1, 0, 1, 1], 1), 7)
})

test('random inputs agree with the all-windows oracle', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 500; t++) {
    const n = 1 + rand(20)
    const customers = Array.from({ length: n }, () => rand(50))
    const grumpy = Array.from({ length: n }, () => rand(2))
    const minutes = 1 + rand(n)
    assert.equal(solve(customers, grumpy, minutes), oracle(customers, grumpy, minutes), JSON.stringify({ customers, grumpy, minutes }))
  }
})

test('parser rejects malformed input', () => {
  assert.throws(() => parseInput('{"customers":[1,2],"grumpy":[0],"minutes":1}'), /one entry per minute/)
  assert.throws(() => parseInput('{"customers":[1,2],"grumpy":[0,2],"minutes":1}'), /0 or 1/)
  assert.throws(() => parseInput('{"customers":[1,2],"grumpy":[0,1],"minutes":3}'), /between 1 and/)
  assert.throws(() => parseInput('{"customers":[-1],"grumpy":[0],"minutes":1}'), /0 to 1000/)
})

test('every frame names a phase, a code line and a message; the last frame is done', () => {
  const run = buildTrace({ customers: [1, 2, 3, 4], grumpy: [1, 0, 1, 1], minutes: 2 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(code.length, python.split('\n').length)
})
