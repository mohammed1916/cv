import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (time, totalTrips) => buildTrace(parseInput(JSON.stringify({ time, totalTrips }))).result

test('2187 worked examples', () => {
  assert.equal(solve([1, 2, 3], 5), 3)
  assert.equal(solve([2], 1), 2)
  assert.equal(solve([1, 1, 1], 4), 2)
  assert.equal(solve([4, 6], 3), 8)
})

test('2187 rejects invalid input', () => {
  assert.throws(() => parseInput('{"time":[],"totalTrips":2}'))
  assert.throws(() => parseInput('{"time":[0],"totalTrips":2}'))
  assert.throws(() => parseInput('{"time":[1],"totalTrips":0}'))
})

test('2187 matches a linear scan over every time', () => {
  let seed = 2187
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const time = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(9))
    const trips = 1 + rnd(20)
    let T = 1
    while (time.reduce((s, v) => s + Math.floor(T / v), 0) < trips) T++
    assert.equal(solve(time, trips), T, JSON.stringify({ time, trips }))
  }
})

test('2187 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"time":[1,2,3],"totalTrips":5}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
