import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm.js'

// Independent oracle: walk the circle explicitly, one edge at a time, in each direction.
function walkLength(distance, from, to) {
  let length = 0
  for (let s = from; s !== to; s = (s + 1) % distance.length) length += distance[s]
  return length
}
function oracle(distance, start, destination) {
  return Math.min(walkLength(distance, start, destination), walkLength(distance, destination, start))
}

test('example with unequal routes gives the shorter side', () => {
  const run = buildTrace(parseInput('{"distance":[7,3,11,4,6,2,9,5],"start":6,"destination":2}'))
  assert.equal(run.result, oracle([7, 3, 11, 4, 6, 2, 9, 5], 6, 2))
})

test('same stop needs no travel and equal routes split evenly', () => {
  assert.equal(buildTrace({ distance: [3, 8, 2], start: 1, destination: 1 }).result, 0)
  assert.equal(buildTrace({ distance: [4, 7, 4, 7], start: 0, destination: 2 }).result, 11)
})

test('random circles agree with the independent oracle for every stop pair', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(9)
    const distance = Array.from({ length: n }, () => rand(20))
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
      assert.equal(buildTrace({ distance, start: a, destination: b }).result, oracle(distance, a, b), JSON.stringify({ distance, a, b }))
    }
  }
})

test('every frame has a phase, a valid code line, a message and a snapshot', () => {
  const run = buildTrace({ distance: [5, 1, 4], start: 2, destination: 0 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot && typeof frame.snapshot === 'object')
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('python and pseudocode line maps stay aligned', () => {
  assert.equal(python.split('\n').length, code.length)
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('input validation rejects out-of-range stops and negative lengths', () => {
  assert.throws(() => parseInput('{"distance":[1,2],"start":2,"destination":0}'))
  assert.throws(() => parseInput('{"distance":[1,-2],"start":0,"destination":1}'))
})
