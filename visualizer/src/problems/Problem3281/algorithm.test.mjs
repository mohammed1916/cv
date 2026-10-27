import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: try every choice of one number per range and keep the best minimum pairwise gap.
function oracle({ start, d }) {
  let best = -1
  const choose = (i, chosen) => {
    if (i === start.length) {
      let gap = Infinity
      for (let a = 0; a < chosen.length; a++) for (let b = a + 1; b < chosen.length; b++) gap = Math.min(gap, Math.abs(chosen[a] - chosen[b]))
      best = Math.max(best, gap)
      return
    }
    for (let x = start[i]; x <= start[i] + d; x++) choose(i + 1, [...chosen, x])
  }
  choose(0, [])
  return best
}

test('3281 official examples', () => {
  assert.equal(solve({ start: [6, 0, 3], d: 2 }), 4)
  assert.equal(solve({ start: [2, 6, 13, 13], d: 5 }), 5)
})

test('3281 zero width ranges and a single gap', () => {
  assert.equal(solve({ start: [1, 1], d: 0 }), 0)
  assert.equal(solve({ start: [0, 10], d: 0 }), 10)
})

test('3281 rejects bad input', () => {
  assert.throws(() => parseInput('{"start":[1],"d":2}'))
  assert.throws(() => parseInput('{"start":[1,2],"d":11}'))
  assert.throws(() => parseInput('{"start":[1,31],"d":2}'))
})

test('3281 random ranges match an exhaustive oracle', () => {
  let seed = 3281
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const count = 2 + rnd(3)
    const start = Array.from({ length: count }, () => rnd(15))
    const d = rnd(7)
    assert.equal(solve({ start, d }), oracle({ start, d }), JSON.stringify({ start, d }))
  }
})
