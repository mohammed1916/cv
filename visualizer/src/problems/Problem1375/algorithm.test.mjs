import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = flips => buildTrace(parseInput(JSON.stringify({ flips }))).result

test('1375 worked examples', () => {
  assert.equal(solve([3, 2, 4, 1, 5]), 2)
  assert.equal(solve([4, 1, 2, 3]), 1)
  assert.equal(solve([1]), 1)
})

// Independent oracle: step i is prefix-aligned when the first i flips are exactly bulbs 1..i.
function oracle(flips) {
  let count = 0
  for (let i = 1; i <= flips.length; i++) {
    const prefix = flips.slice(0, i).sort((a, b) => a - b)
    if (prefix.every((v, j) => v === j + 1)) count++
  }
  return count
}

test('1375 random permutations match a prefix-set oracle', () => {
  let seed = 1375
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const flips = Array.from({ length: 1 + rnd(8) }, (_, i) => i + 1)
    for (let i = flips.length - 1; i > 0; i--) { const j = rnd(i + 1); [flips[i], flips[j]] = [flips[j], flips[i]] }
    assert.equal(solve(flips), oracle(flips), JSON.stringify(flips))
  }
})
