import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (l, r) => buildTrace({ l, r }).result

// Independent oracle: build the set of good numbers by listing every digit subset, then test each x directly.
const goodNumbers = new Set()
for (let mask = 1; mask < 1 << 10; mask++) {
  const digits = [...Array(10).keys()].filter(d => (mask >> d) & 1)
  goodNumbers.add(Number(digits.slice().reverse().join('')))
  if (digits[0] !== 0) goodNumbers.add(Number(digits.join('')))
}
goodNumbers.delete(0)
const digitSum = x => String(x).split('').reduce((a, c) => a + Number(c), 0)
function oracle(l, r) {
  let count = 0
  for (let x = l; x <= r; x++) {
    if (goodNumbers.has(x) || goodNumbers.has(digitSum(x))) count++
  }
  return count
}

test('3869 official examples', () => {
  assert.equal(solve(8, 10), 3)
  assert.equal(solve(12340, 12341), 1)
  assert.equal(solve(123456788, 123456788), 0)
})

test('3869 rejects a range wider than the visualization cap', () => {
  assert.throws(() => parseInput('{"l":1,"r":1000}'))
})

test('3869 random windows match the subset-enumeration oracle', () => {
  let seed = 3869
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const base = t % 2 ? 1 + rnd(100000) : 1 + rnd(1000)
    const l = base
    const r = base + rnd(40)
    assert.equal(solve(l, r), oracle(l, r), `${l}..${r}`)
  }
})
