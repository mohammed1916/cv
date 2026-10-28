import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace(parseInput(JSON.stringify(num))).result

test('2283 official examples', () => {
  assert.equal(solve('1210'), true)
  assert.equal(solve('030'), false)
})

test('2283 single digits and zero counts', () => {
  // A single digit d needs d zeros in the string, which is impossible for d >= 1 and fails for 0.
  assert.equal(solve('0'), false)
  assert.equal(solve('10'), false)
  // "2020": it has two 0s, no 1s, two 2s and no 3s, matching the digits at positions 0 to 3.
  assert.equal(solve('2020'), true)
})

test('2283 rejects non-digits and bad lengths', () => {
  assert.throws(() => parseInput('"12a"'))
  assert.throws(() => parseInput('""'))
  assert.throws(() => parseInput('"12345678901"'))
  assert.throws(() => parseInput('1210'))
})

// Independent oracle: build a count string for each digit position with split and compare.
function oracle(num) {
  return [...num].every((d, i) => num.split(String(i)).length - 1 === Number(d))
}

test('2283 random digit strings match a split-count oracle', () => {
  let seed = 2283
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(10)
    let num = ''
    for (let i = 0; i < len; i++) num += String(rnd(4))
    assert.equal(solve(num), oracle(num), num)
  }
})
