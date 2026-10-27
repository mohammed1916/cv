import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (event1, event2) => buildTrace(parseInput(JSON.stringify({ event1, event2 }))).result

test('2446 official examples', () => {
  assert.equal(solve(['01:15', '02:00'], ['02:00', '03:00']), true)
  assert.equal(solve(['01:00', '02:00'], ['01:20', '03:00']), true)
  assert.equal(solve(['10:00', '11:00'], ['14:00', '15:00']), false)
})

test('2446 events that touch at one minute conflict', () => {
  assert.equal(solve(['09:00', '09:30'], ['09:30', '10:00']), true)
  assert.equal(solve(['09:00', '09:29'], ['09:30', '10:00']), false)
})

test('2446 rejects a time that is not HH:MM', () => {
  assert.throws(() => parseInput('{"event1":["1:00","02:00"],"event2":["01:00","03:00"]}'))
  assert.throws(() => parseInput('{"event1":["02:00","01:00"],"event2":["01:00","03:00"]}'))
})

// Independent oracle: mark every minute of the day that each event covers and look for a shared one.
function oracle(event1, event2) {
  const covers = ([a, b], minute) => {
    const toMinutes = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
    return toMinutes(a) <= minute && minute <= toMinutes(b)
  }
  for (let minute = 0; minute < 24 * 60; minute++) {
    if (covers(event1, minute) && covers(event2, minute)) return true
  }
  return false
}

test('2446 random events match a minute-by-minute check', () => {
  let seed = 2446
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const clock = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  for (let t = 0; t < 300; t++) {
    const a = rnd(1440)
    const b = rnd(1440)
    const c = rnd(1440)
    const d = rnd(1440)
    const event1 = [clock(Math.min(a, b)), clock(Math.max(a, b))]
    const event2 = [clock(Math.min(c, d)), clock(Math.max(c, d))]
    assert.equal(solve(event1, event2), oracle(event1, event2), JSON.stringify([event1, event2]))
  }
})
