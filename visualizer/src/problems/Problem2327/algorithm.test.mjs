import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2327 official examples', () => {
  assert.equal(solve({ n: 6, delay: 2, forget: 4 }), 5)
  assert.equal(solve({ n: 4, delay: 1, forget: 3 }), 6)
})

test('2327 rejects delay that is not below forget', () => {
  assert.throws(() => parseInput('{"n":6,"delay":4,"forget":4}'))
  assert.throws(() => parseInput('{"n":6,"delay":0,"forget":4}'))
})

// Independent oracle: simulate each person as a separate record instead of counting by day.
function oracle({ n, delay, forget }) {
  const people = [1] // the day each person learned the secret
  for (let day = 2; day <= n; day++) {
    const sharers = people.filter(learn => day - learn >= delay && day - learn < forget).length
    for (let s = 0; s < sharers; s++) people.push(day)
  }
  return people.filter(learn => learn + forget > n).length % 1000000007
}

test('2327 random inputs match a per-person simulation', () => {
  let seed = 2327
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(13)
    const delay = 1 + rnd(n - 1)
    const forget = delay + 1 + rnd(n - delay)
    const input = { n, delay, forget }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
