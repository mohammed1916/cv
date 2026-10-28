import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (rolls, k) => buildTrace({ rolls, k }).result

test('2350 official examples', () => {
  assert.equal(solve([4, 2, 1, 2, 3, 3, 2, 4, 1], 4), 3)
  assert.equal(solve([1, 1, 2, 2], 2), 2)
})

test('2350 a single face that never appears gives length one', () => {
  assert.equal(solve([2, 2, 2], 3), 1)
})

test('2350 rejects a face above k', () => {
  assert.throws(() => parseInput(JSON.stringify({ rolls: [1, 5], k: 2 })))
})

// Independent oracle: test every sequence of faces, shortest length first, for being a subsequence of the rolls.
function isSubsequence(seq, rolls) {
  let j = 0
  for (const r of rolls) if (j < seq.length && r === seq[j]) j++
  return j === seq.length
}

function oracle(rolls, k) {
  for (let len = 1; ; len++) {
    const rec = seq => {
      if (seq.length === len) return !isSubsequence(seq, rolls)
      for (let face = 1; face <= k; face++) if (rec([...seq, face])) return true
      return false
    }
    if (rec([])) return len
  }
}

test('2350 random rolls match an exhaustive subsequence oracle', () => {
  let seed = 2350
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const k = 1 + rnd(3)
    const rolls = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(k))
    assert.equal(solve(rolls, k), oracle(rolls, k), JSON.stringify({ rolls, k }))
  }
})
