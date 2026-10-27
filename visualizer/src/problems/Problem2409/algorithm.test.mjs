import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arriveAlice, leaveAlice, arriveBob, leaveBob) =>
  buildTrace(parseInput(JSON.stringify({ arriveAlice, leaveAlice, arriveBob, leaveBob }))).result

test('2409 official examples', () => {
  assert.equal(solve('08-15', '08-18', '08-16', '08-19'), 3)
  assert.equal(solve('10-01', '10-31', '11-01', '12-31'), 0)
})

test('2409 a single shared day', () => {
  assert.equal(solve('03-01', '03-05', '03-05', '03-09'), 1)
})

test('2409 rejects a date that does not exist in a non-leap year', () => {
  assert.throws(() => parseInput('{"arriveAlice":"02-29","leaveAlice":"03-01","arriveBob":"01-01","leaveBob":"01-02"}'))
})

// Independent oracle: list every calendar day as MM-DD text, then count the days inside both stays by string comparison.
function oracle(arriveAlice, leaveAlice, arriveBob, leaveBob) {
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let count = 0
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= monthDays[month - 1]; day++) {
      const label = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const inAlice = arriveAlice <= label && label <= leaveAlice
      const inBob = arriveBob <= label && label <= leaveBob
      if (inAlice && inBob) count++
    }
  }
  return count
}

test('2409 seeded random stays match a day-by-day check', () => {
  let seed = 2409
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const label = d => {
    let rest = d
    for (let month = 1; month <= 12; month++) {
      if (rest <= monthDays[month - 1]) return `${String(month).padStart(2, '0')}-${String(rest).padStart(2, '0')}`
      rest -= monthDays[month - 1]
    }
    throw new Error('day out of range')
  }
  for (let t = 0; t < 300; t++) {
    const a = 1 + rnd(365)
    const b = 1 + rnd(365)
    const c = 1 + rnd(365)
    const d = 1 + rnd(365)
    const [arriveAlice, leaveAlice] = [Math.min(a, b), Math.max(a, b)].map(label)
    const [arriveBob, leaveBob] = [Math.min(c, d), Math.max(c, d)].map(label)
    assert.equal(solve(arriveAlice, leaveAlice, arriveBob, leaveBob), oracle(arriveAlice, leaveAlice, arriveBob, leaveBob))
  }
})
