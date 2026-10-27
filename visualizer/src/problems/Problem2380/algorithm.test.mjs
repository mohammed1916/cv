import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2380 official examples', () => {
  assert.equal(solve('{"s":"0110101"}'), 4)
  assert.equal(solve('{"s":"11100"}'), 0)
})

test('2380 rejects a non-binary character', () => {
  assert.throws(() => parseInput('{"s":"012"}'))
})

// Independent oracle: each 1 waits for the zeros before it; the time is a running max, not a simulation.
function oracle({ s }) {
  let zeros = 0
  let ans = 0
  for (const ch of s) {
    if (ch === '0') zeros += 1
    else if (zeros > 0) ans = Math.max(ans + 1, zeros)
  }
  return ans
}

test('2380 seeded random cases match a running-max oracle', () => {
  let seed = 2380
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let s = ''
    for (let i = 0; i < 1 + rnd(30); i++) s += rnd(2) ? '1' : '0'
    assert.equal(solve(JSON.stringify({ s })), oracle({ s }), s)
  }
})
