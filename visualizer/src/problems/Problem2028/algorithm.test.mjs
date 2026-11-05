import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('examples', () => {
  assert.deepEqual(solve('{"rolls":[3,2,4,3],"mean":4,"n":2}'), [6, 6])
  assert.deepEqual(solve('{"rolls":[1,5,6],"mean":3,"n":4}'), [3, 2, 2, 2])
  assert.deepEqual(solve('{"rolls":[1,2,3,4],"mean":6,"n":4}'), [])
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"rolls":[1],"mean":2,"n":1}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random cases: valid rolls average to the mean, or no answer exists', () => {
  let state = 389
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const rolls = Array.from({ length: 1 + rand(6) }, () => 1 + rand(6))
    const mean = 1 + rand(6), n = 1 + rand(6)
    const got = solve(JSON.stringify({ rolls, mean, n }))
    if (got.length === 0) {
      // Check by exhaustive search over the sum of n dice (small n): no sum makes the average exact.
      let possible = false
      const sums = new Set([0])
      for (let d = 0; d < n; d++) { const next = new Set(); for (const s of sums) for (let f = 1; f <= 6; f++) next.add(s + f); sums.clear(); next.forEach(v => sums.add(v)) }
      if (sums.has(((rolls.length + n) * mean) - rolls.reduce((a, b) => a + b, 0))) possible = true
      assert.equal(possible, false, JSON.stringify({ rolls, mean, n }))
    } else {
      assert.equal(got.length, n)
      assert.ok(got.every(v => v >= 1 && v <= 6))
      assert.equal(got.reduce((a, b) => a + b, 0) + rolls.reduce((a, b) => a + b, 0), (rolls.length + n) * mean)
    }
  }
})
