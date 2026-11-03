import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Reference: compare every pair directly.
const brute = nums => nums.map(v => nums.filter(w => w < v).length)

test('sample arrays give the counts from direct comparison, including duplicates', () => {
  assert.deepEqual(buildTrace(parseInput('[8,1,2,2,3]')).result, [4, 0, 1, 1, 3])
  assert.deepEqual(buildTrace(parseInput('[6,5,4,8]')).result, [2, 1, 0, 3])
  assert.deepEqual(buildTrace(parseInput('[7,7,7,7]')).result, [0, 0, 0, 0])
})

test('random arrays agree with the brute comparison', () => {
  let state = 23
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let k = 0; k < 300; k++) {
    const nums = Array.from({ length: 1 + rand(12) }, () => rand(101))
    assert.deepEqual(buildTrace(nums).result, brute(nums), JSON.stringify(nums))
  }
})

test('parse rejects values outside 0 to 100 and empty arrays', () => {
  assert.throws(() => parseInput('[]'), /1 to 12/)
  assert.throws(() => parseInput('[101]'), /0 to 100/)
  assert.throws(() => parseInput('[-1]'), /0 to 100/)
})

test('every frame names a real phase, a code line and a Python line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  const run = buildTrace([8, 1, 2, 2, 3])
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
