import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const solve = nums => buildTrace(nums).result
const sum = xs => xs.reduce((a, b) => a + b, 0)

// Oracle: for each group size, find the largest possible sum; the smallest size whose best group beats the rest wins.
function bruteForce(nums) {
  const total = sum(nums)
  const bestBySize = Array(nums.length + 1).fill(-Infinity)
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    const picked = nums.filter((_, i) => mask & (1 << i))
    bestBySize[picked.length] = Math.max(bestBySize[picked.length], sum(picked))
  }
  for (let k = 1; k <= nums.length; k++) {
    if (bestBySize[k] > total - bestBySize[k]) return { size: k, total: bestBySize[k] }
  }
  return null
}

test('sample [2, 7, 5, 1] gives [7, 5]', () => {
  assert.deepEqual(solve([2, 7, 5, 1]), [7, 5])
})

test('a single value is returned alone', () => {
  assert.deepEqual(solve([9]), [9])
})

test('random inputs give the shortest group with the largest sum', () => {
  let seed = 5
  const rnd = m => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(30))
    const got = solve(nums)
    const expected = bruteForce(nums)
    assert.equal(got.length, expected.size, JSON.stringify(nums))
    assert.equal(sum(got), expected.total, JSON.stringify(nums))
    for (let i = 1; i < got.length; i++) assert.ok(got[i - 1] >= got[i], JSON.stringify(nums))
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0, 3]'))
  assert.throws(() => parseInput('{"a": 1}'))
})

test('every frame names a declared phase and a valid code line', () => {
  const run = buildTrace([2, 7, 5, 1])
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
