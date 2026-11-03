import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, rounds) => buildTrace({ n, rounds }).result

test('1560 sample runs give the expected sectors', () => {
  assert.deepEqual(solve(6, [2, 4, 5, 6, 1, 3]), [2, 3])
  assert.deepEqual(solve(8, [7, 1, 2, 3]), [1, 2, 3, 7, 8])
  assert.deepEqual(solve(4, [1, 4, 1]), [1])
})

test('1560 rejects malformed runs', () => {
  assert.throws(() => parseInput('{"n":1,"rounds":[1,1]}'), /2 to 100/)
  assert.throws(() => parseInput('{"n":4,"rounds":[1]}'), /2 to 50/)
  assert.throws(() => parseInput('{"n":4,"rounds":[1,5]}'), /from 1 to n/)
  assert.throws(() => parseInput('{"n":4,"rounds":[2,2]}'), /different/)
})

// Oracle: simulate every lap step by step, then keep the sectors whose visit count is maximal.
test('1560 formula matches a step-by-step simulation', () => {
  let seed = 3
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const len = 2 + rnd(7)
    const rounds = [1 + rnd(n)]
    while (rounds.length < len) {
      const next = 1 + rnd(n)
      if (next !== rounds[rounds.length - 1]) rounds.push(next)
    }
    const visits = Array(n + 1).fill(0)
    visits[rounds[0]] += 1
    for (let i = 0; i + 1 < rounds.length; i++) {
      for (let x = rounds[i]; x !== rounds[i + 1];) { x = (x % n) + 1; visits[x] += 1 }
    }
    const top = Math.max(...visits.slice(1))
    const expected = []
    for (let s = 1; s <= n; s++) if (visits[s] === top) expected.push(s)
    const input = JSON.stringify({ n, rounds })
    parseInput(input)
    assert.deepEqual(solve(n, rounds), expected, input)
  }
})
