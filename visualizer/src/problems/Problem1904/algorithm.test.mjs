import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (login_time, logout_time) => buildTrace(parseInput(JSON.stringify({ login_time, logout_time }))).result

test('1904 official examples', () => {
  assert.equal(solve('12:01', '12:44'), 1)
  assert.equal(solve('21:30', '03:00'), 22)
  assert.equal(solve('09:31', '10:14'), 1)
})

test('1904 edge cases', () => {
  assert.equal(solve('00:00', '00:00'), 0)
  assert.equal(solve('23:59', '00:00'), 0)
  assert.equal(solve('00:00', '23:45'), 95)
})

test('1904 rejects malformed times', () => {
  assert.throws(() => parseInput('{"login_time":"24:00","logout_time":"10:00"}'))
  assert.throws(() => parseInput('{"login_time":"9:31","logout_time":"10:00"}'))
})

// Independent oracle: scan every minute of the session and count the round starts on the quarter hour.
function oracle(login, logout) {
  const toMin = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
  const s = toMin(login)
  let e = toMin(logout)
  if (e < s) e += 1440
  let count = 0
  for (let t = s; t + 15 <= e; t++) if (t % 15 === 0) count++
  return count
}

test('1904 seeded random sessions match a minute-scan oracle', () => {
  let seed = 1904
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const clock = () => `${String(rnd(24)).padStart(2, '0')}:${String(rnd(60)).padStart(2, '0')}`
  for (let t = 0; t < 300; t++) {
    const a = clock()
    const b = clock()
    assert.equal(solve(a, b), oracle(a, b), `${a} ${b}`)
  }
})
