import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3074 official examples', () => {
  assert.equal(solve({ apple: [1, 3, 2], capacity: [4, 3, 1, 5, 2] }), 2)
  assert.equal(solve({ apple: [5, 5, 5], capacity: [2, 4, 2, 7] }), 4)
})

test('3074 boxes that cannot hold the apples are rejected', () => {
  assert.throws(() => parseInput('{"apple":[5],"capacity":[1,2]}'))
})

// Independent oracle: try every subset of boxes and keep the smallest one that holds all apples.
function oracle(apple, capacity) {
  const need = apple.reduce((s, v) => s + v, 0)
  const m = capacity.length
  let best = Infinity
  for (let mask = 1; mask < 1 << m; mask++) {
    let size = 0
    let held = 0
    for (let i = 0; i < m; i++) {
      if (mask & (1 << i)) {
        size++
        held += capacity[i]
      }
    }
    if (held >= need && size < best) best = size
  }
  return best
}

test('3074 random inputs match the subset oracle', () => {
  let seed = 3074
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 400 && checked < 150; t++) {
    const apple = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(6))
    const capacity = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(6))
    if (capacity.reduce((s, v) => s + v, 0) < apple.reduce((s, v) => s + v, 0)) continue
    checked++
    assert.equal(solve({ apple, capacity }), oracle(apple, capacity), JSON.stringify({ apple, capacity }))
  }
  assert.equal(checked, 150)
})
