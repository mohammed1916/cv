import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = customers => buildTrace(parseInput(JSON.stringify({ customers }))).result

test('2483 official examples', () => {
  assert.equal(solve('YYNY'), 2)
  assert.equal(solve('NNNNN'), 0)
  assert.equal(solve('YYYY'), 4)
})

test('2483 a tie returns the earliest hour', () => {
  // Hour 0 and hour 2 both have penalty 1; the earlier one wins.
  assert.equal(solve('NY'), 0)
})

test('2483 rejects a character other than Y or N', () => {
  assert.throws(() => parseInput('{"customers":"YX"}'))
})

// Independent oracle: compute the penalty of every closing hour directly.
function oracle(customers) {
  let bestHour = 0
  let best = Infinity
  for (let j = 0; j <= customers.length; j++) {
    let penalty = 0
    for (let i = 0; i < j; i++) if (customers[i] === 'N') penalty++
    for (let i = j; i < customers.length; i++) if (customers[i] === 'Y') penalty++
    if (penalty < best) {
      best = penalty
      bestHour = j
    }
  }
  return bestHour
}

test('2483 seeded random strings match a per-hour oracle', () => {
  let seed = 2483
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const customers = Array.from({ length: 1 + rnd(12) }, () => (rnd(2) === 0 ? 'Y' : 'N')).join('')
    assert.equal(solve(customers), oracle(customers), customers)
  }
})
