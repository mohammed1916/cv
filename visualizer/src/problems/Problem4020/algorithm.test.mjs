import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, requests) => buildTrace({ n, requests }).result

test('4020 official examples', () => {
  assert.equal(solve(5, [2, 1, 4, 3]), 7)
  assert.equal(solve(3, [2, 0, 0]), 4)
})

test('4020 a request already on the current floor costs nothing', () => {
  assert.equal(solve(4, [0, 0, 0]), 0)
})

test('4020 rejects a floor outside the building', () => {
  assert.throws(() => parseInput('{"n":3,"requests":[3]}'))
})

// Independent oracle: simulate the elevator one floor at a time, counting each second.
function oracle(n, requests) {
  let pos = 0
  let seconds = 0
  for (const target of requests) {
    while (pos !== target) {
      pos += pos < target ? 1 : -1
      seconds++
    }
  }
  return seconds
}

test('4020 random cases match a second-by-second simulation', () => {
  let seed = 4020
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(20)
    const requests = Array.from({ length: 1 + rnd(12) }, () => rnd(n))
    assert.equal(solve(n, requests), oracle(n, requests), JSON.stringify({ n, requests }))
  }
})
