import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute(nums) {
  let best = 0
  for (let a = 0; a < nums.length; a++) {
    const seen = new Set()
    let sum = 0
    for (let b = a; b < nums.length && !seen.has(nums[b]); b++) {
      seen.add(nums[b]); sum += nums[b]
      best = Math.max(best, sum)
    }
  }
  return best
}

test('1695 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 10)
  assert.ok(python.includes('def maximumUniqueSubarray'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1695 matches brute force on random arrays', () => {
  let seed = 31
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(6))
    assert.equal(buildTrace(nums).result, brute(nums), JSON.stringify(nums))
  }
})

test('1695 rejects invalid input', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[]'))
})
