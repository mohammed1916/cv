import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2682 official examples', () => {
  assert.deepEqual(solve('{"n":5,"k":2}'), [4, 5])
  assert.deepEqual(solve('{"n":4,"k":4}'), [2, 3, 4])
})

test('2682 rejects a non-positive k', () => {
  assert.throws(() => parseInput('{"n":5,"k":0}'))
})

// Independent oracle: after t passes the ball sits at k * t(t+1)/2 mod n; stop at the first repeated seat.
function oracle({ n, k }) {
  const seen = new Set([0])
  for (let t = 1; ; t++) {
    const seat = (k * t * (t + 1) / 2) % n
    if (seen.has(seat)) break
    seen.add(seat)
  }
  return [...Array(n).keys()].filter(i => !seen.has(i)).map(i => i + 1)
}

test('2682 seeded random cases match a closed-form oracle', () => {
  let seed = 2682
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { n: 1 + rnd(20), k: 1 + rnd(20) }
    assert.deepEqual(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
