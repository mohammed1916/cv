import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = values => buildTrace(parseInput(JSON.stringify({ values }))).result

test('1019 official examples', () => {
  assert.deepEqual(solve([2, 1, 5]), [5, 5, 0])
  assert.deepEqual(solve([2, 7, 4, 3, 5]), [7, 0, 5, 5, 0])
  assert.deepEqual(solve([1, 7, 5, 1, 9, 2, 5, 1]), [7, 9, 9, 9, 0, 5, 0, 0])
})

test('1019 equal values are not greater', () => {
  assert.deepEqual(solve([3, 3, 3]), [0, 0, 0])
})

test('1019 rejects an empty list', () => {
  assert.throws(() => parseInput('{"values":[]}'))
})

// Independent oracle: for each position, scan forward for the first strictly larger value.
function oracle(values) {
  return values.map((v, i) => {
    for (let j = i + 1; j < values.length; j++) if (values[j] > v) return values[j]
    return 0
  })
}

test('1019 random lists match a forward-scan oracle', () => {
  let seed = 1019
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(10))
    assert.deepEqual(solve(values), oracle(values), JSON.stringify(values))
  }
})
