import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

// Checks the rules from first principles: n(n-1) matches, each ordered pair once, no team on consecutive days.
function isValid(n, schedule) {
  if (schedule.length !== n * (n - 1)) return false
  const seen = new Set()
  for (let i = 0; i < schedule.length; i++) {
    const [h, a] = schedule[i]
    if (h === a || h < 0 || a < 0 || h >= n || a >= n) return false
    const key = `${h}>${a}`
    if (seen.has(key)) return false
    seen.add(key)
    if (i > 0) {
      const [ph, pa] = schedule[i - 1]
      if ([ph, pa].some(team => team === h || team === a)) return false
    }
  }
  return true
}

test('3680 two and three teams have no schedule', () => {
  assert.deepEqual(solve(2), [])
  assert.deepEqual(solve(3), [])
})

test('3680 any returned schedule satisfies every rule', () => {
  for (const n of [4]) {
    const schedule = solve(n)
    if (schedule.length > 0) assert.equal(isValid(n, schedule), true)
  }
})

test('3680 rejects n outside the visual range', () => {
  assert.throws(() => parseInput('{"n":1}'))
  assert.throws(() => parseInput('{"n":5}'))
  assert.deepEqual(parseInput('{"n":4}'), { n: 4 })
})
