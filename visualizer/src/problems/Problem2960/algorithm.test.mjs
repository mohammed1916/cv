import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2960 official examples', () => {
  assert.equal(solve('{"batteryPercentages":[1,1,2,1,3]}'), 3)
  assert.equal(solve('{"batteryPercentages":[0,1,2]}'), 2)
})

test('2960 rejects a percentage above 100', () => {
  assert.throws(() => parseInput('{"batteryPercentages":[101]}'))
})

// Independent oracle: literally test each positive device and drain every later device by one, clamped at zero.
function oracle({ batteryPercentages }) {
  const b = [...batteryPercentages]
  let count = 0
  for (let i = 0; i < b.length; i++) {
    if (b[i] > 0) {
      count += 1
      for (let j = i + 1; j < b.length; j++) b[j] = Math.max(0, b[j] - 1)
    }
  }
  return count
}

test('2960 seeded random cases match a literal simulation', () => {
  let seed = 2960
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    const input = { batteryPercentages: Array.from({ length: len }, () => rnd(8)) }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
