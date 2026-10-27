import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2528 official example', () => {
  assert.equal(solve({ stations: [1, 2, 4, 5, 0], r: 1, k: 2 }), 5)
})

test('2528 rejects a negative k', () => {
  assert.throws(() => parseInput('{"stations":[1,2],"r":0,"k":-1}'))
})

// Independent oracle: try every way to split k new stations among the cities and keep the best minimum.
function oracle({ stations, r, k }) {
  const n = stations.length
  const powerOf = extra => stations.map((_, i) => {
    let sum = 0
    for (let j = Math.max(0, i - r); j <= Math.min(n - 1, i + r); j++) sum += stations[j] + extra[j]
    return sum
  })
  let best = -Infinity
  const split = (index, left, extra) => {
    if (index === n - 1) {
      const placed = [...extra, left]
      best = Math.max(best, Math.min(...powerOf(placed)))
      return
    }
    for (let x = 0; x <= left; x++) split(index + 1, left - x, [...extra, x])
  }
  split(0, k, [])
  return best
}

test('2528 seeded random cases match exhaustive placement', () => {
  let seed = 2528
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 100; t++) {
    const input = { stations: Array.from({ length: 1 + rnd(5) }, () => rnd(6)), r: rnd(3), k: rnd(5) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
