import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace({ num }).result

test('1323 sample inputs change the leftmost 6 only', () => {
  assert.equal(solve(9669), 9969)
  assert.equal(solve(9996), 9999)
  assert.equal(solve(6666), 9666)
})

test('1323 numbers without a 6 are unchanged', () => {
  assert.equal(solve(9), 9)
  assert.equal(solve(999), 999)
})

test('1323 rejects malformed input', () => {
  assert.throws(() => parseInput('{"num":1234}'), /6 and 9/)
  assert.throws(() => parseInput('{"num":0}'), /num/)
  assert.throws(() => parseInput('[66]'), /object/)
})

// Independent oracle: among the number itself and every single-digit change in either direction, take the maximum.
test('1323 matches a single-change oracle on every 1 to 6 digit 6/9 number', () => {
  const all = []
  const build = prefix => {
    if (prefix.length > 0) all.push(Number(prefix))
    if (prefix.length === 5) return
    build(prefix + '6')
    build(prefix + '9')
  }
  build('')
  for (const num of all) {
    const s = String(num)
    let best = num
    for (let i = 0; i < s.length; i++) {
      const flipped = s.slice(0, i) + (s[i] === '6' ? '9' : '6') + s.slice(i + 1)
      best = Math.max(best, Number(flipped))
    }
    assert.equal(solve(num), best, String(num))
  }
})
