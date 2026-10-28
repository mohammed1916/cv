import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (day, month, year) => buildTrace(parseInput(JSON.stringify({ day, month, year }))).result

test('1185 official examples', () => {
  assert.equal(solve(31, 8, 2019), 'Saturday')
  assert.equal(solve(18, 7, 1999), 'Sunday')
  assert.equal(solve(15, 8, 1993), 'Sunday')
})

test('1185 edge cases and validation', () => {
  assert.equal(solve(1, 1, 1971), 'Friday')
  assert.equal(solve(31, 12, 2100), 'Friday')
  assert.throws(() => parseInput('{"day":29,"month":2,"year":1971}'))
  assert.throws(() => parseInput('{"day":1,"month":1,"year":1970}'))
  assert.throws(() => parseInput('{"day":31,"month":4,"year":2000}'))
})

// Independent oracle: the JavaScript Date calendar, read in UTC.
const NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const oracle = (day, month, year) => NAMES[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]

test('1185 seeded random dates match a calendar oracle', () => {
  let seed = 1185
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 600; t++) {
    const day = 1 + rnd(31)
    const month = 1 + rnd(12)
    const year = 1971 + rnd(130)
    let got
    try {
      got = solve(day, month, year)
    } catch {
      continue
    }
    checked++
    assert.equal(got, oracle(day, month, year), `${day}/${month}/${year}`)
  }
  assert.ok(checked > 100)
})
