import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace(parseInput(JSON.stringify({ num }))).result

test('1362 official examples', () => {
  assert.deepEqual(solve(8), [3, 3])
  assert.deepEqual(solve(123), [5, 25])
})

test('1362 edge cases and validation', () => {
  assert.deepEqual(solve(1), [1, 2])
  assert.throws(() => parseInput('{"num":0}'))
  assert.throws(() => parseInput('{"num":1000000001}'))
})

// Independent oracle: try every a from 1 up to each target and keep the closest pair.
function oracle(num) {
  let best = null
  for (const target of [num + 1, num + 2]) {
    for (let a = 1; a <= target; a++) {
      if (target % a === 0 && a <= target / a) {
        const pair = [a, target / a]
        if (best === null || pair[1] - pair[0] < best[1] - best[0]) best = pair
      }
    }
  }
  return best
}

test('1362 seeded random cases match an exhaustive oracle', () => {
  let seed = 1362
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const num = 1 + rnd(2000)
    assert.deepEqual(solve(num), oracle(num), String(num))
  }
})
