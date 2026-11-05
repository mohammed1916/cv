import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute(nums) {
  let count = 0
  const n = nums.length
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) for (let d = 0; d < n; d++) {
    if (new Set([a, b, c, d]).size === 4 && nums[a] * nums[b] === nums[c] * nums[d]) count++
  }
  return count
}

test('1726 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 10)
  assert.ok(python.includes('def tupleSameProduct'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1726 matches a four-index brute force', () => {
  assert.equal(buildTrace([2, 3, 4, 6]).result, 8)
  let seed = 181
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 60; t++) {
    const pool = [1, 2, 3, 4, 6, 8, 9, 12].sort(() => rnd(3) - 1)
    const nums = pool.slice(0, 2 + rnd(6))
    assert.equal(buildTrace(nums).result, brute(nums), JSON.stringify(nums))
  }
})

test('1726 rejects invalid input', () => {
  assert.throws(() => parseInput('[1,1]'))
  assert.throws(() => parseInput('[0]'))
})
