import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arrivalTime, delayedTime) => buildTrace({ arrivalTime, delayedTime }).result

test('2651 worked examples', () => {
  assert.equal(solve(9, 4), 13)
  assert.equal(solve(21, 6), 3)
})

test('2651 edge cases around midnight', () => {
  assert.equal(solve(23, 1), 0)
  assert.equal(solve(1, 23), 0)
  assert.equal(solve(1, 24), 1)
  assert.equal(solve(23, 24), 23)
})

test('2651 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"arrivalTime":0,"delayedTime":5}'))
  assert.throws(() => parseInput('{"arrivalTime":24,"delayedTime":5}'))
  assert.throws(() => parseInput('{"arrivalTime":5,"delayedTime":25}'))
})

test('2651 frames end at the result with executable Python lines', () => {
  const trace = buildTrace({ arrivalTime: 21, delayedTime: 6 })
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 3)
})

// Independent oracle: walk the clock one hour at a time.
test('2651 matches an hour-by-hour oracle over the full range', () => {
  for (let arrival = 1; arrival <= 23; arrival++) {
    for (let delay = 1; delay <= 24; delay++) {
      let hour = arrival
      for (let k = 0; k < delay; k++) hour = (hour + 1) % 24
      assert.equal(solve(arrival, delay), hour, `${arrival} ${delay}`)
    }
  }
})
