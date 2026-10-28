import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2463 official examples', () => {
  assert.equal(solve({ robot: [0, 4, 6], factory: [[2, 2], [6, 2]] }), 4)
  assert.equal(solve({ robot: [1, -1], factory: [[-2, 1], [2, 1]] }), 2)
})

test('2463 a robot already at a factory costs nothing', () => {
  assert.equal(solve({ robot: [5], factory: [[5, 1]] }), 0)
})

test('2463 rejects factories without enough capacity', () => {
  assert.throws(() => parseInput('{"robot":[1,2],"factory":[[0,1]]}'))
})

// Independent oracle: try every assignment of robots to factories that respects each limit, and keep the cheapest.
function oracle({ robot, factory }) {
  const left = factory.map(([, limit]) => limit)
  let best = Infinity
  const assign = (r, cost) => {
    if (cost >= best) return
    if (r === robot.length) {
      best = cost
      return
    }
    for (let f = 0; f < factory.length; f++) {
      if (left[f] === 0) continue
      left[f]--
      assign(r + 1, cost + Math.abs(robot[r] - factory[f][0]))
      left[f]++
    }
  }
  assign(0, 0)
  return best
}

test('2463 seeded random inputs match an exhaustive assignment', () => {
  let seed = 2463
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 150; t++) {
    const robot = Array.from({ length: 1 + rnd(5) }, () => rnd(13) - 6)
    const factory = Array.from({ length: 1 + rnd(3) }, () => [rnd(13) - 6, 1 + rnd(4)])
    if (factory.reduce((sum, [, limit]) => sum + limit, 0) < robot.length) continue
    const input = { robot, factory }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
    checked++
  }
  assert.ok(checked > 50)
})
