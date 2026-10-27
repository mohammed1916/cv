import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (flowers, people) => buildTrace(parseInput(JSON.stringify({ flowers, people }))).result

test('2251 examples', () => {
  assert.deepEqual(solve([[1, 6], [3, 7], [9, 12], [4, 13]], [2, 3, 7, 11]), [1, 2, 2, 2])
  assert.deepEqual(solve([[1, 10], [3, 3]], [3, 3, 2]), [2, 2, 1])
})

test('2251 both endpoints count as in bloom', () => {
  assert.deepEqual(solve([[2, 4]], [2, 4, 5]), [1, 1, 0])
})

test('2251 rejects an inverted flower and an arrival time out of range', () => {
  assert.throws(() => parseInput('{"flowers":[[5,2]],"people":[3]}'))
  assert.throws(() => parseInput('{"flowers":[[1,2]],"people":[26]}'))
})

// Independent oracle: test every flower against every arrival time directly.
test('2251 random inputs match a direct interval oracle', () => {
  let seed = 2251
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const flowers = Array.from({ length: 1 + rnd(10) }, () => { const a = 1 + rnd(20), b = 1 + rnd(20); return [Math.min(a, b), Math.max(a, b)] })
    const people = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(25))
    const expected = people.map(p => flowers.filter(([s, e]) => s <= p && p <= e).length)
    assert.deepEqual(solve(flowers, people), expected, JSON.stringify({ flowers, people }))
  }
})
