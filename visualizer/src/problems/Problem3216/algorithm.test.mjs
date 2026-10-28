import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(s).result

test('3216 official examples', () => {
  assert.equal(solve('45320'), '43520')
  assert.equal(solve('001'), '001')
})

test('3216 digits of different parity are never swapped', () => {
  assert.equal(solve('21'), '21')
})

test('3216 non-digits are rejected', () => {
  assert.throws(() => parseInput('"a1"'))
})

// Independent oracle: try the original string and every adjacent swap of equal-parity digits.
function oracle(s) {
  let best = s
  for (let i = 0; i + 1 < s.length; i++) {
    if (Number(s[i]) % 2 !== Number(s[i + 1]) % 2) continue
    const chars = [...s]
    ;[chars[i], chars[i + 1]] = [chars[i + 1], chars[i]]
    const candidate = chars.join('')
    if (candidate < best) best = candidate
  }
  return best
}

test('3216 random digit strings match the single-swap oracle', () => {
  let seed = 3216
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    let s = ''
    const len = 1 + rnd(8)
    for (let i = 0; i < len; i++) s += rnd(10)
    assert.equal(solve(s), oracle(s), s)
  }
})
