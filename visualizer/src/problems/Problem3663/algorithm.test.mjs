import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3663 worked examples', () => {
  assert.equal(solve(1553322), 1)
  assert.equal(solve(2), 2)
  assert.equal(solve(1122), 1)
  assert.equal(solve(1223), 1)
})

test('3663 rejects zero and non-integers', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":1.5}'))
})

// Independent oracle: count each digit 0 to 9 by splitting the string, then sort the present digits by (count, digit).
function oracle(n) {
  const text = String(n)
  const present = []
  for (let d = 0; d <= 9; d++) {
    const count = text.split(String(d)).length - 1
    if (count > 0) present.push([count, d])
  }
  present.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  return present[0][1]
}

test('3663 random integers match a sort-based oracle', () => {
  let seed = 3663
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let n = 1 + rnd(9)
    for (let i = rnd(9); i > 0; i--) n = n * 10 + rnd(10)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
