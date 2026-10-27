import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('2595 official examples', () => {
  assert.deepEqual(solve(50), [1, 2])
  assert.deepEqual(solve(2), [0, 1])
})

test('2595 the single bit 1 sits at an even position', () => {
  assert.deepEqual(solve(1), [1, 0])
})

test('2595 rejects zero', () => {
  assert.throws(() => parseInput('{"n":0}'))
})

// Independent oracle: write n in binary, reverse the digits, and count the ones at even and odd indices.
function oracle(n) {
  const digits = n.toString(2).split('').reverse()
  let even = 0
  let odd = 0
  digits.forEach((d, i) => { if (d === '1') { if (i % 2 === 0) even++; else odd++ } })
  return [even, odd]
}

test('2595 random values match a binary-string oracle', () => {
  let seed = 2595
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(1000)
    assert.deepEqual(solve(n), oracle(n), String(n))
  }
})
