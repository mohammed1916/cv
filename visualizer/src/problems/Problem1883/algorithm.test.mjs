import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1883 official examples', () => {
  assert.equal(solve({ dist: [1, 3, 2], speed: 4, hours_before: 2 }), 1)
  assert.equal(solve({ dist: [7, 3, 5, 5], speed: 2, hours_before: 10 }), 2)
  assert.equal(solve({ dist: [7, 3, 5, 5], speed: 1, hours_before: 10 }), -1)
})

test('1883 a single road needs no rest and no skips', () => {
  assert.equal(solve({ dist: [6], speed: 4, hours_before: 2 }), 0)
})

test('1883 rejects a speed of zero', () => {
  assert.throws(() => parseInput('{"dist":[1],"speed":0,"hours_before":1}'))
})

// Independent oracle: try every choice of which of the rests after the first n - 1 roads to skip, using fractional hours.
function oracle({ dist, speed, hours_before: hoursBefore }) {
  const n = dist.length
  let best = -1
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    let time = 0
    for (let i = 0; i < n; i++) {
      time += dist[i] / speed
      if (i < n - 1 && !((mask >> i) & 1)) time = Math.ceil(time - 1e-9)
    }
    if (time <= hoursBefore + 1e-9) {
      let skips = 0
      for (let b = mask; b; b &= b - 1) skips++
      if (best === -1 || skips < best) best = skips
    }
  }
  return best
}

test('1883 seeded random inputs match a rest-by-rest enumeration', () => {
  let seed = 1883
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const input = { dist: Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(9)), speed: 1 + rnd(4), hours_before: 1 + rnd(8) }
    assert.equal(solve(input), oracle({ ...input, hours_before: input.hours_before }), JSON.stringify(input))
  }
})
