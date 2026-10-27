import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (positions, healths, directions) => buildTrace(parseInput(JSON.stringify({ positions, healths, directions }))).result

test('2751 official examples', () => {
  assert.deepEqual(solve([5, 4, 3, 2, 1], [2, 17, 9, 15, 10], 'RRRRR'), [2, 17, 9, 15, 10])
  assert.deepEqual(solve([3, 5, 2, 6], [10, 10, 15, 12], 'RLRL'), [14])
  assert.deepEqual(solve([1, 2, 5, 6], [10, 10, 11, 11], 'RLRL'), [])
})

test('2751 the left robot can survive a stack of right movers', () => {
  // The left robot (health 5) destroys both right movers in turn and keeps 3 health.
  assert.deepEqual(solve([1, 2, 3], [1, 1, 5], 'RRL'), [3])
})

test('2751 rejects a repeated position', () => {
  assert.throws(() => parseInput('{"positions":[1,1],"healths":[1,1],"directions":"RL"}'))
})

// Independent oracle: simulate second by second. A right mover and a left mover collide when they meet or cross.
// Crossing events in one second are resolved in order of how far apart the pair started.
function oracle(positions, healths, directions) {
  const robots = positions.map((p, i) => ({ id: i, p, h: healths[i], d: directions[i] }))
  for (let t = 0; t < 80; t++) {
    const before = robots.map(r => r.p)
    robots.forEach(r => { r.p += r.d === 'R' ? 1 : -1 })
    const events = []
    robots.forEach((r, a) => robots.forEach((l, b) => {
      if (r.d === 'R' && l.d === 'L' && before[a] < before[b] && r.p >= l.p) events.push({ gap: before[b] - before[a], r, l })
    }))
    events.sort((x, y) => x.gap - y.gap)
    for (const { r, l } of events) {
      if (r.h <= 0 || l.h <= 0) continue
      if (r.h > l.h) { r.h -= 1; l.h = 0 } else if (r.h < l.h) { l.h -= 1; r.h = 0 } else { r.h = 0; l.h = 0 }
    }
  }
  return robots.filter(r => r.h > 0).map(r => r.h)
}

test('2751 random inputs match a second-by-second simulation', () => {
  let seed = 2751
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(5)
    const pool = Array.from({ length: 15 }, (_, k) => k + 1)
    const positions = []
    while (positions.length < n) positions.push(pool.splice(rnd(pool.length), 1)[0])
    const healths = Array.from({ length: n }, () => 1 + rnd(4))
    const directions = Array.from({ length: n }, () => 'LR'[rnd(2)]).join('')
    assert.deepEqual(solve(positions, healths, directions), oracle(positions, healths, directions), JSON.stringify({ positions, healths, directions }))
  }
})
