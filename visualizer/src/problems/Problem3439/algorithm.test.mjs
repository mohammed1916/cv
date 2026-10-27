import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (eventTime, startTime, endTime, k) =>
  buildTrace(parseInput(JSON.stringify({ eventTime, startTime, endTime, k }))).result

test('3439 examples', () => {
  assert.equal(solve(5, [1, 3], [2, 5], 1), 2)
  assert.equal(solve(10, [0, 7, 9], [1, 8, 10], 1), 7)
})

test('3439 with no moves the answer is the largest gap', () => {
  assert.equal(solve(10, [0, 7, 9], [1, 8, 10], 0), 6)
})

test('3439 rejects overlapping meetings', () => {
  assert.throws(() => parseInput('{"eventTime":10,"startTime":[1,2],"endTime":[4,5],"k":1}'))
})

// Independent oracle: try every set of at most k moved meetings. Meetings keep their order, so the moved ones
// sit inside the span between the unmoved meetings around them; the free block is that span minus their durations.
function oracle({ eventTime, startTime, endTime, k }) {
  const n = startTime.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let moved = 0
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) moved++
    if (moved > k) continue
    let blockStart = 0
    let insideDuration = 0
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) {
        insideDuration += endTime[i] - startTime[i]
        continue
      }
      best = Math.max(best, startTime[i] - blockStart - insideDuration)
      blockStart = endTime[i]
      insideDuration = 0
    }
    best = Math.max(best, eventTime - blockStart - insideDuration)
  }
  return best
}

test('3439 seeded random schedules match a subset enumeration', () => {
  let seed = 3439
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const eventTime = 2 * n + rnd(30)
    // Pick 2n distinct cut points in increasing order: meeting i runs from cuts[2i] to cuts[2i+1].
    const pool = Array.from({ length: eventTime + 1 }, (_, i) => i)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const cuts = pool.slice(0, 2 * n).sort((a, b) => a - b)
    const startTime = []
    const endTime = []
    for (let i = 0; i < n; i++) {
      startTime.push(cuts[2 * i])
      endTime.push(cuts[2 * i + 1])
    }
    const k = rnd(n + 1)
    const input = { eventTime, startTime, endTime, k }
    assert.equal(solve(eventTime, startTime, endTime, k), oracle(input), JSON.stringify(input))
  }
})
