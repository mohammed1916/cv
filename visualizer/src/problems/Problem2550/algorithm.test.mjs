import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('2550 examples', () => {
  assert.equal(solve(3), 6)
  assert.equal(solve(4), 14)
})

test('2550 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":2}'))
  assert.throws(() => parseInput('{"n":13}'))
})

// Independent oracle: simulate every direction choice for one second. A collision is two monkeys on one vertex,
// or two neighbours swapping across the edge between them.
function oracle(n) {
  let collisions = 0
  for (let mask = 0; mask < 2 ** n; mask++) {
    const dir = i => (mask >> i) & 1
    const seen = new Set()
    let hit = false
    for (let i = 0; i < n; i++) {
      const v = dir(i) ? (i + 1) % n : (i - 1 + n) % n
      if (seen.has(v)) hit = true
      seen.add(v)
      if (dir(i) && !dir((i + 1) % n)) hit = true
    }
    if (hit) collisions++
  }
  return collisions
}

test('2550 small polygons match simulation of every direction choice', () => {
  for (let n = 3; n <= 10; n++) assert.equal(solve(n), oracle(n) % 1000000007, `n=${n}`)
})
