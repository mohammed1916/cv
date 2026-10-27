import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, sick) => buildTrace(parseInput(JSON.stringify({ n, sick }))).result

test('2954 examples', () => {
  assert.equal(solve(4, [1]), 3)
  assert.equal(solve(5, [0, 4]), 4)
})

test('2954 edge cases', () => {
  assert.equal(solve(2, [0]), 1)
  assert.equal(solve(3, [0, 1]), 1)
})

test('2954 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":4,"sick":[]}'))
  assert.throws(() => parseInput('{"n":4,"sick":[2,1]}'))
  assert.throws(() => parseInput('{"n":4,"sick":[4]}'))
})

// Independent oracle: count infection orders directly with a memoised search over the set of infected children.
function oracle(n, sick) {
  const full = (1 << n) - 1
  const memo = new Map()
  const count = mask => {
    if (mask === full) return 1
    if (memo.has(mask)) return memo.get(mask)
    let total = 0
    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) continue
      const touches = (j > 0 && (mask & (1 << (j - 1)))) || (j < n - 1 && (mask & (1 << (j + 1))))
      if (touches) total += count(mask | (1 << j))
    }
    memo.set(mask, total)
    return total
  }
  let start = 0
  for (const s of sick) start |= 1 << s
  return count(start) % 1000000007
}

test('2954 random cases match infection-order search', () => {
  let seed = 2954
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rnd(7)
    const sick = []
    for (let i = 0; i < n; i++) if (rnd(2)) sick.push(i)
    if (sick.length === 0 || sick.length === n) continue
    assert.equal(solve(n, sick), oracle(n, sick), JSON.stringify({ n, sick }))
  }
})
