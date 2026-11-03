import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute(nums, target) {
  let best = null
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) for (let k = j + 1; k < nums.length; k++) {
    const s = nums[i] + nums[j] + nums[k]
    if (best === null || Math.abs(s - target) < Math.abs(best - target)) best = s
  }
  return best
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

test('16 examples and metadata are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
  assert.equal(code.length, 10)
  assert.ok(python.includes('def threeSumClosest'))
  assert.equal(Object.keys(pythonLineMap).length, 10)
})

test('16 matches brute-force closest distance on random arrays', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let trial = 0; trial < 300; trial++) {
    const len = 3 + rnd(8)
    const nums = Array.from({ length: len }, () => rnd(41) - 20)
    const target = rnd(81) - 40
    const run = buildTrace(parseInput(JSON.stringify({ nums, target })))
    const expected = brute(nums, target)
    assert.equal(Math.abs(run.result - target), Math.abs(expected - target), JSON.stringify({ nums, target }))
    checkFrames(run)
  }
})

test('16 rejects invalid input', () => {
  for (const bad of ['[1,2,3]', '{"nums":[1,2],"target":0}', '{"nums":[1,2,3],"target":1.5}', 'nope']) assert.throws(() => parseInput(bad))
})
