import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3178 official examples', () => {
  assert.equal(solve('{"n":3,"k":5}'), 1)
  assert.equal(solve('{"n":5,"k":6}'), 2)
  assert.equal(solve('{"n":4,"k":2}'), 2)
})

test('3178 rejects a single child', () => {
  assert.throws(() => parseInput('{"n":1,"k":3}'))
})

// Independent oracle: the pass bounces back and forth with period 2(n-1); fold the remainder back into the line.
function oracle({ n, k }) {
  const period = 2 * (n - 1)
  const t = k % period
  return t < n ? t : period - t
}

test('3178 seeded random cases match a closed-form oracle', () => {
  let seed = 3178
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { n: 2 + rnd(30), k: 1 + rnd(200) }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
