import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent reference: repeatedly remove the smallest remaining value as the start of one run.
function reference(nums, k) {
  if (nums.length % k !== 0) return false
  const left = [...nums].sort((a, b) => a - b)
  while (left.length) {
    const start = left[0]
    for (let j = 0; j < k; j++) {
      const idx = left.indexOf(start + j)
      if (idx < 0) return false
      left.splice(idx, 1)
    }
  }
  return true
}

test('sample partitions into runs of four', () => {
  assert.equal(buildTrace({ nums: [1, 2, 3, 3, 4, 4, 5, 6], k: 4 }).result, true)
})

test('a gap inside a run makes the division impossible', () => {
  assert.equal(buildTrace({ nums: [1, 2, 4, 5, 6, 7], k: 3 }).result, false)
})

test('lengths that are not a multiple of k are rejected', () => {
  assert.equal(buildTrace({ nums: [5, 5, 6, 6, 7, 7, 8, 8, 9], k: 4 }).result, false)
})

test('random inputs agree with the reference', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const k = 1 + rand(4)
    const n = k * (1 + rand(4))
    const nums = Array.from({ length: n }, () => rand(8))
    assert.equal(buildTrace({ nums, k }).result, reference(nums, k), JSON.stringify({ nums, k }))
  }
})

test('every frame names a real phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const input of [{ nums: [1, 2, 3, 3, 4, 4, 5, 6], k: 4 }, { nums: [1, 2, 4, 5, 6, 7], k: 3 }]) {
    const run = buildTrace(input)
    for (const frame of run.frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
      assert.ok(frame.message.length > 10)
      assert.ok(frame.snapshot)
    }
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[1,2]'), /Use an object/)
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'), /k is an integer/)
  assert.throws(() => parseInput('{"nums":[],"k":2}'), /nums is a list/)
})
