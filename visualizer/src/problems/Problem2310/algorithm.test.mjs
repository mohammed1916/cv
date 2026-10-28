import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2310 official examples', () => {
  assert.equal(solve({ num: 58, k: 9 }), 2)
  assert.equal(solve({ num: 37, k: 2 }), -1)
  assert.equal(solve({ num: 0, k: 7 }), 0)
})

test('2310 edge cases', () => {
  assert.equal(solve({ num: 10, k: 0 }), 1)
  assert.equal(solve({ num: 5, k: 5 }), 1)
  assert.equal(solve({ num: 5, k: 0 }), -1)
})

test('2310 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"num":3001,"k":1}'))
  assert.throws(() => parseInput('{"num":4,"k":10}'))
})

// Independent oracle: unbounded coin change over the positive numbers that end in k.
function oracle({ num, k }) {
  const best = Array(num + 1).fill(Infinity)
  best[0] = 0
  for (let s = 1; s <= num; s++) {
    for (let x = 1; x <= s; x++) {
      if (x % 10 === k && best[s - x] + 1 < best[s]) best[s] = best[s - x] + 1
    }
  }
  return best[num] === Infinity ? -1 : best[num]
}

test('2310 seeded random cases match a coin-change oracle', () => {
  let seed = 2310
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { num: rnd(301), k: rnd(10) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
