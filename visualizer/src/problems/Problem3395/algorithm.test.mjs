import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('3395 official examples', () => {
  assert.equal(solve([1, 1, 1, 1, 1, 1]), 6)
  assert.equal(solve([1, 2, 2, 3, 3, 4]), 4)
  assert.equal(solve([1, 2, 3, 4, 5, 6, 7]), 0)
})

test('3395 the middle value must be the single most frequent one', () => {
  assert.equal(solve([1, 1, 2, 2, 2]), 1)
  assert.equal(solve([2, 1, 1, 2, 2]), 0)
  assert.equal(solve([5, 5, 5, 5, 5]), 1)
})

test('3395 rejects bad input', () => {
  assert.throws(() => parseInput('[1,2,3,4]'))
  assert.throws(() => parseInput('[1,2,0,3,4]'))
  assert.throws(() => parseInput('[1,2,3,4,101]'))
})

test('3395 every frame points at a real pseudocode line', () => {
  for (const frame of buildTrace([1, 1, 2, 2, 2, 3]).frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
})

// Independent oracle: test every 5-element subset of positions directly, with no middle-first search.
function oracle(nums) {
  const n = nums.length
  let total = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const idx = []
    for (let b = 0; b < n; b++) if ((mask >> b) & 1) idx.push(b)
    if (idx.length !== 5) continue
    const seq = idx.map(b => nums[b])
    const freq = new Map()
    for (const v of seq) freq.set(v, (freq.get(v) ?? 0) + 1)
    const top = Math.max(...freq.values())
    const leaders = [...freq.values()].filter(c => c === top).length
    if (leaders === 1 && freq.get(seq[2]) === top) total += 1
  }
  return total % 1000000007
}

test('3395 random arrays match the subset oracle', () => {
  let seed = 3395
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let k = 0; k < 150; k++) {
    const length = 5 + rnd(6)
    const arr = Array.from({ length }, () => 1 + rnd(4))
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
