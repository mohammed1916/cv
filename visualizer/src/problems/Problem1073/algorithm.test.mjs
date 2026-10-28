import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr1, arr2) => buildTrace(parseInput(JSON.stringify({ arr1, arr2 }))).result

test('1073 official examples', () => {
  assert.deepEqual(solve([1, 1, 1, 1, 1], [1, 0, 1]), [1, 0, 0, 0, 0])
  assert.deepEqual(solve([0], [0]), [0])
  assert.deepEqual(solve([0], [1]), [1])
  assert.deepEqual(solve([1, 1, 1], [1, 1, 1, 1, 1]), [1, 0, 0, 1, 0])
})

test('1073 carries that cancel to zero', () => {
  assert.deepEqual(solve([1, 1], [1, 1]), [1, 0])
  assert.deepEqual(solve([1, 0, 1], [1, 0, 1]), [1, 1, 1, 1, 0])
})

test('1073 rejects bad digits and leading zeros', () => {
  assert.throws(() => parseInput('{"arr1":[2],"arr2":[1]}'))
  assert.throws(() => parseInput('{"arr1":[0,1],"arr2":[1]}'))
  assert.throws(() => parseInput('{"arr1":[],"arr2":[1]}'))
})

// Independent oracle: convert both arrays to integers with Horner's rule, add, and convert back.
const toInt = arr => arr.reduce((acc, d) => acc * -2n + BigInt(d), 0n)
function toNegabinary(n) {
  if (n === 0n) return [0]
  const out = []
  while (n !== 0n) {
    let r = n % 2n
    if (r < 0n) r += 2n
    out.push(Number(r))
    n = (n - r) / -2n
  }
  return out.reverse()
}

test('1073 seeded random cases match an integer-conversion oracle', () => {
  let seed = 1073
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const make = () => {
    const len = 1 + rnd(12)
    return Array.from({ length: len }, (_, i) => (i === 0 && len > 1 ? 1 : rnd(2)))
  }
  for (let t = 0; t < 300; t++) {
    const a = make()
    const b = make()
    assert.deepEqual(solve(a, b), toNegabinary(toInt(a) + toInt(b)), JSON.stringify([a, b]))
  }
})
