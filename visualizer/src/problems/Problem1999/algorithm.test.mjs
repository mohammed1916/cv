import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (k, digit1, digit2) => buildTrace({ k, digit1, digit2 }).result

test('1999 worked examples', () => {
  assert.equal(solve(2, 0, 2), 20)
  assert.equal(solve(3, 4, 2), 24)
  assert.equal(solve(2, 0, 0), -1)
})

test('1999 digits may coincide and zero alone cannot make a positive number', () => {
  assert.equal(solve(6, 3, 3), -1)
  assert.equal(solve(5, 0, 0), -1)
  assert.equal(solve(3, 1, 1), 111)
})

test('1999 frames keep the queue in ascending order and point at real lines', () => {
  const run = buildTrace({ k: 7, digit1: 9, digit2: 2 })
  assert.equal(run.result, 222222)
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.trim().split('\n').length)
    for (let i = 1; i < frame.queue.length; i++) assert.ok(frame.queue[i - 1] < frame.queue[i])
  }
  assert.equal(run.frames.at(-1).answer, 222222)
})

test('1999 rejects malformed input', () => {
  assert.throws(() => parseInput('{"k":0,"digit1":1,"digit2":2}'))
  assert.throws(() => parseInput('{"k":3,"digit1":10,"digit2":2}'))
})

// Oracle: scan the multiples of k in increasing order up to a fixed limit.
function oracle(k, a, b, limit = 200000) {
  for (let m = k + 1; m <= limit; m += 1) {
    if (m % k !== 0) continue
    const s = String(m)
    if ([...s].every(c => c === String(a) || c === String(b))) return m
  }
  return null
}

test('1999 random inputs agree with a bounded scan', () => {
  let seed = 1999
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const k = 1 + rnd(60)
    const a = rnd(10), b = rnd(10)
    const got = solve(k, a, b)
    const want = oracle(k, a, b)
    if (want !== null) assert.equal(got, want, JSON.stringify({ k, a, b }))
    else assert.ok(got === -1 || got > 200000, JSON.stringify({ k, a, b, got }))
  }
})
