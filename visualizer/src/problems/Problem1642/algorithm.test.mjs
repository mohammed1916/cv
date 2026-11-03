import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: binary search on the answer. A prefix of buildings is reachable when the
// total of the cheapest climbs that cannot be covered by ladders fits in the bricks.
function oracle({ heights, bricks, ladders }) {
  const reachable = last => {
    const climbs = []
    for (let i = 0; i < last; i++) {
      const d = heights[i + 1] - heights[i]
      if (d > 0) climbs.push(d)
    }
    climbs.sort((a, b) => b - a)
    const brickCost = climbs.slice(ladders).reduce((sum, d) => sum + d, 0)
    return brickCost <= bricks
  }
  let lo = 0, hi = heights.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (reachable(mid)) lo = mid
    else hi = mid - 1
  }
  return lo
}

test('a hand-made case stops at building 4 when the bricks run out', () => {
  const run = buildTrace(parseInput('{"heights":[1,5,3,8,2,9],"bricks":4,"ladders":1}'))
  assert.equal(run.result, 4)
  assert.equal(run.result, oracle(run.input))
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('a flat row is reachable to the end with no tools', () => {
  assert.equal(buildTrace({ heights: [3, 3, 3, 3], bricks: 0, ladders: 0 }).result, 3)
})

test('with no bricks or ladders, the walk stops at the first climb', () => {
  assert.equal(buildTrace({ heights: [2, 6, 1, 9], bricks: 0, ladders: 0 }).result, 0)
})

test('random cases agree with the independent oracle', () => {
  let state = 41
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rand(12)
    const heights = Array.from({ length: n }, () => rand(30))
    const input = { heights, bricks: rand(60), ladders: rand(5) }
    assert.equal(buildTrace(input).result, oracle(input), JSON.stringify(input))
  }
})

test('invalid inputs are rejected', () => {
  assert.throws(() => parseInput('{"heights":[],"bricks":1,"ladders":0}'))
  assert.throws(() => parseInput('{"heights":[1,2],"bricks":-1,"ladders":0}'))
  assert.throws(() => parseInput('{"heights":[1,2],"bricks":1,"ladders":1.5}'))
  assert.throws(() => parseInput('[1,2]'))
})
