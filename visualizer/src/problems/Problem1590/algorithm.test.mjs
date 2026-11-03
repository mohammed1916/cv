import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute(nums, p) {
  const total = nums.reduce((s, v) => s + v, 0)
  let best = -1
  for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
    if (j - i + 1 === nums.length) continue
    let sum = 0
    for (let k = 0; k < nums.length; k++) if (k < i || k > j) sum += nums[k]
    if (sum % p === 0 && (best === -1 || j - i + 1 < best)) best = j - i + 1
  }
  return total % p === 0 ? 0 : best
}

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  assert.equal(run.frames[0].phase, 'start')
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.equal(typeof frame.activeLine, 'number')
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
  }
}

test('1590 examples and metadata are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
  assert.equal(code.length, 11)
  assert.ok(python.includes('def minSubarrayRemoval'))
  assert.equal(Object.keys(pythonLineMap).length, 11)
})

test('1590 matches brute force on random arrays', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let trial = 0; trial < 400; trial++) {
    const len = 1 + rnd(8)
    const nums = Array.from({ length: len }, () => rnd(12))
    const p = 1 + rnd(9)
    const run = buildTrace(parseInput(JSON.stringify({ nums, p })))
    assert.equal(run.result, brute(nums, p), JSON.stringify({ nums, p }))
    checkFrames(run)
  }
})

test('1590 rejects invalid input', () => {
  for (const bad of ['{"nums":[],"p":3}', '{"nums":[1,-2],"p":3}', '{"nums":[1],"p":0}', '[1,2]']) assert.throws(() => parseInput(bad))
})
