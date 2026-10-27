import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1103 official examples', () => {
  assert.deepEqual(solve('{"candies":7,"numPeople":4}'), [1, 2, 3, 1])
  assert.deepEqual(solve('{"candies":10,"numPeople":3}'), [5, 2, 3])
})

test('1103 rejects zero people', () => {
  assert.throws(() => parseInput('{"candies":7,"numPeople":0}'))
})

// Independent oracle: find the full turns with a triangular-number bound, then add the partial turn.
function oracle({ candies, numPeople }) {
  const res = Array(numPeople).fill(0)
  let T = 0
  while (((T + 1) * (T + 2)) / 2 <= candies) T += 1
  for (let t = 1; t <= T; t++) res[(t - 1) % numPeople] += t
  const left = candies - (T * (T + 1)) / 2
  if (left > 0) res[T % numPeople] += left
  return res
}

test('1103 seeded random cases match a triangular-number oracle', () => {
  let seed = 1103
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { candies: 1 + rnd(100), numPeople: 1 + rnd(10) }
    assert.deepEqual(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
