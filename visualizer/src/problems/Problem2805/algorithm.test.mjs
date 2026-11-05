import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const times = (delay, period, cancelTime) => buildTrace(parseInput(JSON.stringify({ delay, period, cancelTime }))).result
const PY = python.split('\n')

test('2805 worked examples', () => {
  assert.deepEqual(times(50, 20, 225), [50, 120, 210])
  assert.deepEqual(times(20, 20, 150), [20, 60, 120])
  assert.deepEqual(times(100, 200, 500), [100, 400])
})

test('2805 cancel before the first call gives no calls', () => {
  assert.deepEqual(times(30, 20, 29), [])
})

test('2805 frames point at real python lines', () => {
  for (const f of buildTrace({ delay: 20, period: 20, cancelTime: 100 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

// Oracle: simulate the timers as a sorted list of absolute times.
function oracle(delay, period, cancelTime) {
  const out = []
  let next = delay
  for (let count = 0; next <= cancelTime; count++) {
    out.push(next)
    next += delay + period * (count + 1)
  }
  return out
}

test('2805 random schedules match an oracle', () => {
  let seed = 2805
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 200; t++) {
    const delay = 20 + rnd(231), period = 20 + rnd(231), cancelTime = rnd(1001)
    assert.deepEqual(times(delay, period, cancelTime), oracle(delay, period, cancelTime), JSON.stringify({ delay, period, cancelTime }))
  }
})
