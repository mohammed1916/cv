import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (eventTime, startTime, endTime) => buildTrace({ eventTime, startTime, endTime }).result

test('3440 official examples', () => {
  assert.equal(solve(5, [1, 3], [2, 5]), 2)
  assert.equal(solve(10, [0, 7, 9], [1, 8, 10]), 7)
  assert.equal(solve(10, [0, 3, 7, 9], [1, 4, 8, 10]), 6)
  assert.equal(solve(5, [0, 1, 2, 3, 4], [1, 2, 3, 4, 5]), 0)
})

test('3440 a meeting that cannot fit anywhere leaves the free time unchanged', () => {
  // Meetings [0,2] and [2,3] leave only a gap of 1 at the end. Moving either one cannot beat that.
  assert.equal(solve(4, [0, 2], [2, 3]), 1)
})

test('3440 rejects overlapping meetings', () => {
  assert.throws(() => parseInput('{"eventTime":5,"startTime":[0,1],"endTime":[3,4]}'))
})

// Independent oracle: try every legal start time for every meeting, then measure the longest free stretch directly.
function oracle(eventTime, startTime, endTime) {
  const meetings = startTime.map((s, i) => [s, endTime[i]])
  const longest = list => {
    const sorted = [...list].sort((a, b) => a[0] - b[0])
    let best = 0
    let cursor = 0
    for (const [s, e] of sorted) {
      best = Math.max(best, s - cursor)
      cursor = e
    }
    return Math.max(best, eventTime - cursor)
  }
  let best = longest(meetings)
  meetings.forEach(([s, e], i) => {
    const dur = e - s
    const others = meetings.filter((_, k) => k !== i)
    for (let t = 0; t + dur <= eventTime; t++) {
      const clash = others.some(([a, b]) => !(t + dur <= a || t >= b))
      if (clash) continue
      best = Math.max(best, longest([...others, [t, t + dur]]))
    }
  })
  return best
}

test('3440 random schedules match a try-every-start oracle', () => {
  let seed = 3440
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const eventTime = 2 + rnd(20)
    const count = 2 + rnd(4)
    // Build non-overlapping meetings by cutting the event into random slots.
    const cuts = Array.from({ length: count * 2 }, () => rnd(eventTime + 1)).sort((a, b) => a - b)
    const startTime = []
    const endTime = []
    for (let i = 0; i < count; i++) {
      if (cuts[2 * i] < cuts[2 * i + 1] && (startTime.length === 0 || cuts[2 * i] >= endTime[endTime.length - 1])) {
        startTime.push(cuts[2 * i])
        endTime.push(cuts[2 * i + 1])
      }
    }
    if (startTime.length < 2) continue
    assert.equal(solve(eventTime, startTime, endTime), oracle(eventTime, startTime, endTime), JSON.stringify({ eventTime, startTime, endTime }))
  }
})
