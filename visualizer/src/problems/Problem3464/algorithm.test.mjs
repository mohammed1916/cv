import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (side, points, k) => buildTrace(parseInput(JSON.stringify({ side, points, k }))).result

test('3464 official-style examples', () => {
  // Two corners of a side-2 square are 4 apart; adding the middle of an edge halves the best pair.
  assert.equal(solve(2, [[0, 0], [2, 2]], 2), 4)
  assert.equal(solve(2, [[0, 0], [0, 2], [2, 0], [2, 2]], 4), 2)
  assert.equal(solve(2, [[0, 0], [0, 1], [0, 2], [2, 2]], 3), 2)
})

test('3464 points must lie on the boundary and be distinct', () => {
  assert.throws(() => parseInput('{"side":2,"points":[[1,1],[0,0]],"k":2}'))
  assert.throws(() => parseInput('{"side":2,"points":[[0,0],[0,0]],"k":2}'))
  assert.throws(() => parseInput('{"side":2,"points":[[0,0],[2,2]],"k":3}'))
})

// Independent oracle: try every choice of k points and keep the one whose closest pair is farthest apart.
function oracle(points, k) {
  const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
  let best = -Infinity
  const choose = (start, chosen) => {
    if (chosen.length === k) {
      let closest = Infinity
      for (let i = 0; i < chosen.length; i++) {
        for (let j = i + 1; j < chosen.length; j++) closest = Math.min(closest, dist(chosen[i], chosen[j]))
      }
      best = Math.max(best, closest)
      return
    }
    for (let i = start; i < points.length; i++) choose(i + 1, [...chosen, points[i]])
  }
  choose(0, [])
  return best
}

test('3464 random boundary points match the subset oracle', () => {
  let seed = 3464
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const side = 1 + rnd(6)
    const boundary = []
    for (let x = 0; x <= side; x++) for (let y = 0; y <= side; y++) if (x === 0 || y === 0 || x === side || y === side) boundary.push([x, y])
    const pool = [...boundary]
    const count = 2 + rnd(Math.min(6, pool.length - 1))
    const points = Array.from({ length: count }, () => pool.splice(rnd(pool.length), 1)[0])
    const k = 2 + rnd(count - 1)
    assert.equal(solve(side, points, k), oracle(points, k), JSON.stringify({ side, points, k }))
  }
})
