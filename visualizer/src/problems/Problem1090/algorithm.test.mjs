import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('1090 official examples', () => {
  assert.equal(solve({ values: [5, 4, 3, 2, 1], labels: [1, 1, 2, 2, 3], num_wanted: 3, use_limit: 1 }), 9)
  assert.equal(solve({ values: [5, 4, 3, 2, 1], labels: [1, 3, 3, 3, 2], num_wanted: 3, use_limit: 2 }), 12)
  assert.equal(solve({ values: [9, 8, 8, 7, 6], labels: [0, 0, 0, 1, 1], num_wanted: 3, use_limit: 1 }), 16)
})

test('1090 the label limit applies even when more items are wanted', () => {
  assert.equal(solve({ values: [4, 4, 4], labels: [7, 7, 7], num_wanted: 3, use_limit: 2 }), 8)
})

test('1090 rejects mismatched label lengths', () => {
  assert.throws(() => parseInput('{"values":[1,2],"labels":[1],"num_wanted":1,"use_limit":1}'))
})

// Independent oracle: try every subset of items, keep those within num_wanted and the label limits, and take the best sum.
function oracle({ values, labels, num_wanted, use_limit }) {
  let best = 0
  for (let mask = 0; mask < 1 << values.length; mask++) {
    let size = 0
    let sum = 0
    const per = {}
    let ok = true
    for (let i = 0; i < values.length; i++) {
      if (!(mask & (1 << i))) continue
      size++
      sum += values[i]
      per[labels[i]] = (per[labels[i]] ?? 0) + 1
      if (per[labels[i]] > use_limit) ok = false
    }
    if (ok && size <= num_wanted && sum > best) best = sum
  }
  return best
}

test('1090 random inputs match a subset oracle', () => {
  let seed = 1090
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    const input = {
      values: Array.from({ length: len }, () => rnd(11)),
      labels: Array.from({ length: len }, () => rnd(4)),
      num_wanted: 1 + rnd(4),
      use_limit: 1 + rnd(3),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
