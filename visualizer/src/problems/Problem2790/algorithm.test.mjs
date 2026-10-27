import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: try every choice of a new group (a set of numbers with spare uses, larger than the last group).
function oracle(usageLimits) {
  const n = usageLimits.length
  const size = mask => { let c = 0; for (let i = 0; i < n; i++) c += (mask >> i) & 1; return c }
  let best = 0
  const go = (rem, last, count) => {
    best = Math.max(best, count)
    for (let mask = 1; mask < 1 << n; mask++) {
      const s = size(mask)
      if (s <= last) continue
      if (rem.some((r, i) => (mask >> i) & 1 && r === 0)) continue
      go(rem.map((r, i) => r - ((mask >> i) & 1)), s, count + 1)
    }
  }
  go([...usageLimits], 0, 0)
  return best
}

test('2790 official examples', () => {
  assert.equal(solve({ usageLimits: [1, 2, 5] }), 3)
  assert.equal(solve({ usageLimits: [2, 1, 2] }), 2)
})

test('2790 one number and one large limit', () => {
  assert.equal(solve({ usageLimits: [1] }), 1)
  assert.equal(solve({ usageLimits: [1, 1] }), 1)
  assert.equal(solve({ usageLimits: [6, 6, 6] }), 3)
})

test('2790 rejects bad input', () => {
  assert.throws(() => parseInput('{"usageLimits":[]}'))
  assert.throws(() => parseInput('{"usageLimits":[7]}'))
  assert.throws(() => parseInput('{"usageLimits":[0]}'))
})

test('2790 random limits match a group-building oracle', () => {
  let seed = 2790
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const usageLimits = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(4))
    assert.equal(solve({ usageLimits }), oracle(usageLimits), JSON.stringify(usageLimits))
  }
})
