import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = events => buildTrace({ events }).result

test('1353 official examples', () => {
  assert.equal(solve([[1, 2], [2, 3], [3, 4]]), 3)
  assert.equal(solve([[1, 2], [2, 2], [3, 4], [3, 4]]), 4)
})

test('1353 events sharing a single day allow only one attendance', () => {
  assert.equal(solve([[5, 5], [5, 5], [5, 5]]), 1)
})

test('1353 rejects an event that ends before it starts', () => {
  assert.throws(() => parseInput(JSON.stringify({ events: [[3, 2]] })))
})

// Independent oracle: try every choice of a day for each event (or none), with no two events on one day.
function oracle(events) {
  let best = 0
  const rec = (i, usedDays, count) => {
    if (count + (events.length - i) <= best) return
    if (i === events.length) { best = Math.max(best, count); return }
    rec(i + 1, usedDays, count)
    const [s, e] = events[i]
    for (let d = s; d <= e; d++) {
      if (usedDays & (1 << d)) continue
      rec(i + 1, usedDays | (1 << d), count + 1)
    }
  }
  rec(0, 0, 0)
  return best
}

test('1353 random events match a day-assignment oracle', () => {
  let seed = 1353
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const events = Array.from({ length: n }, () => {
      const s = 1 + rnd(8)
      return [s, s + rnd(9 - s)]
    })
    assert.equal(solve(events), oracle(events), JSON.stringify(events))
  }
})
