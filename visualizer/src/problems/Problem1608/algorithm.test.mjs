import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent reference: the first x in 0..n whose count of values >= x equals x.
function reference(nums) {
  for (let x = 0; x <= nums.length; x++) {
    let count = 0
    for (const v of nums) if (v >= x) count++
    if (count === x) return x
  }
  return -1
}

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 10)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, `code line ${f.activeLine}`)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.split('\n').length, `python line ${f.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('sample finds 3 with three entries at least 3', () => {
  const run = buildTrace([1, 9, 2, 0, 5, 5])
  assert.equal(run.result, 3)
  assertFrames(run)
})

test('all zeros have no valid candidate', () => {
  assert.equal(buildTrace([0, 0, 0]).result, -1)
})

test('when every value is large the answer is the length', () => {
  assert.equal(buildTrace([7, 7, 7, 7, 7, 7, 7]).result, 7)
})

test('random arrays agree with the reference', () => {
  let seed = 3
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rand(10) }, () => rand(12))
    const run = buildTrace(nums)
    assert.equal(run.result, reference(nums), JSON.stringify(nums))
    assertFrames(run)
  }
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1, -2]'))
})
