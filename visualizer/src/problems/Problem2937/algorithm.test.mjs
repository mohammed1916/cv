import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s1, s2, s3) => buildTrace({ s1, s2, s3 }).result

test('2937 worked examples', () => {
  assert.equal(solve('abc', 'abb', 'ab'), 2)
  assert.equal(solve('dac', 'bac', 'cac'), -1)
})

test('2937 edge cases', () => {
  assert.equal(solve('a', 'a', 'a'), 0)
  assert.equal(solve('a', 'b', 'c'), -1)
  assert.equal(solve('ab', 'ab', 'ab'), 0)
  assert.equal(solve('abc', 'ab', 'a'), 3)
  assert.throws(() => parseInput('{"s1":"","s2":"a","s3":"a"}'))
})

// Independent oracle: try every target length t >= 1 that all three strings can reach by trimming.
function oracle(s1, s2, s3) {
  let best = -1
  for (let t = 1; t <= Math.min(s1.length, s2.length, s3.length); t++) {
    if (s1.slice(0, t) === s2.slice(0, t) && s1.slice(0, t) === s3.slice(0, t)) {
      const cost = s1.length + s2.length + s3.length - 3 * t
      if (best < 0 || cost < best) best = cost
    }
  }
  return best
}

test('2937 random strings match a trimming oracle', () => {
  let seed = 2937
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = () => Array.from({ length: 1 + rnd(5) }, () => 'ab'[rnd(2)]).join('')
  for (let t = 0; t < 400; t++) {
    const [a, b, c] = [word(), word(), word()]
    assert.equal(solve(a, b, c), oracle(a, b, c), JSON.stringify([a, b, c]))
  }
})
