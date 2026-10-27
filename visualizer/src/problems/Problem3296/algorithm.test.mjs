import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: try every split of the height among the workers and keep the smallest slowest-worker time.
function oracle({ mountainHeight, workerTimes }) {
  let best = Infinity
  const split = (i, left, worst) => {
    if (worst >= best) return
    if (i === workerTimes.length) {
      if (left === 0) best = worst
      return
    }
    for (let x = 0; x <= left; x++) {
      split(i + 1, left - x, Math.max(worst, workerTimes[i] * (x * (x + 1)) / 2))
    }
  }
  split(0, mountainHeight, 0)
  return best
}

test('3296 official examples', () => {
  assert.equal(solve({ mountainHeight: 4, workerTimes: [2, 1, 1] }), 3)
  assert.equal(solve({ mountainHeight: 10, workerTimes: [3, 2, 2, 4] }), 12)
  assert.equal(solve({ mountainHeight: 5, workerTimes: [1] }), 15)
})

test('3296 a single layer and a single worker', () => {
  assert.equal(solve({ mountainHeight: 1, workerTimes: [8] }), 8)
  assert.equal(solve({ mountainHeight: 3, workerTimes: [1, 1] }), 3)
})

test('3296 rejects bad input', () => {
  assert.throws(() => parseInput('{"mountainHeight":0,"workerTimes":[1]}'))
  assert.throws(() => parseInput('{"mountainHeight":3,"workerTimes":[]}'))
  assert.throws(() => parseInput('{"mountainHeight":3,"workerTimes":[9]}'))
})

test('3296 random mountains match a split-enumeration oracle', () => {
  let seed = 3296
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const mountainHeight = 1 + rnd(7)
    const workerTimes = Array.from({ length: 1 + rnd(3) }, () => 1 + rnd(8))
    assert.equal(solve({ mountainHeight, workerTimes }), oracle({ mountainHeight, workerTimes }), JSON.stringify({ mountainHeight, workerTimes }))
  }
})
