import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = time => buildTrace(parseInput(JSON.stringify({ time }))).result

test('2437 official examples', () => {
  assert.equal(solve('?5:00'), 2)
  assert.equal(solve('0?:0?'), 100)
  assert.equal(solve('??:??'), 1440)
})

test('2437 edge cases and validation', () => {
  assert.equal(solve('2?:??'), 240)
  assert.equal(solve('23:59'), 1)
  assert.throws(() => parseInput('{"time":"1:00"}'))
  assert.throws(() => parseInput('{"time":"12-30"}'))
  assert.throws(() => parseInput('{"time":"1a:00"}'))
})

// Independent oracle: turn ? into a digit class, then test every time of day as a string.
function oracle(time) {
  const re = new RegExp(`^${time.replace(/\?/g, '[0-9]')}$`)
  let count = 0
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m++) {
      const text = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      if (re.test(text)) count++
    }
  }
  return count
}

test('2437 seeded random patterns match a regular-expression oracle', () => {
  let seed = 2437
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const half = () => Array.from({ length: 2 }, () => (rnd(3) === 0 ? '?' : String(rnd(10)))).join('')
  for (let t = 0; t < 200; t++) {
    const time = `${half()}:${half()}`
    assert.equal(solve(time), oracle(time), time)
  }
})
