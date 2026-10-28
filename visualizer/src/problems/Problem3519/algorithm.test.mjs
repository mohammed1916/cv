import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (l, r, b) => buildTrace(parseInput(JSON.stringify({ l, r, b }))).result

test('3519 official examples', () => {
  assert.equal(solve('23', '28', 8), 3)
  assert.equal(solve('2', '7', 2), 2)
})

test('3519 a single value in range', () => {
  // 7 is 111 in base 2 (non-decreasing); 11 is 1011 (not).
  assert.equal(solve('7', '7', 2), 1)
  assert.equal(solve('11', '11', 2), 0)
})

test('3519 rejects bad input', () => {
  assert.throws(() => parseInput('{"l":"05","r":"9","b":8}'))
  assert.throws(() => parseInput('{"l":"9","r":"5","b":8}'))
  assert.throws(() => parseInput('{"l":"1","r":"9","b":11}'))
})

// Independent oracle: brute force over every integer in [l, r], checking its base-b digits directly.
function oracle(l, r, b) {
  let count = 0
  for (let v = Number(l); v <= Number(r); v++) {
    const digits = v === 0 ? [0] : [...v.toString(b)].map(c => parseInt(c, b))
    if (digits.every((d, i) => i === 0 || digits[i - 1] <= d)) count++
  }
  return count
}

test('3519 random ranges match a brute-force oracle', () => {
  let seed = 3519
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const lo = 1 + rnd(3000)
    const hi = lo + rnd(3000)
    const b = 2 + rnd(9)
    assert.equal(solve(String(lo), String(hi), b), oracle(String(lo), String(hi), b), `${lo} ${hi} ${b}`)
  }
})
