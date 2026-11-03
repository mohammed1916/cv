import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: try start values one by one and check every prefix directly.
function reference(nums) {
  for (let start = 1; ; start++) {
    let sum = start
    let ok = true
    for (const v of nums) {
      sum += v
      if (sum < 1) { ok = false; break }
    }
    if (ok) return start
  }
}

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 0)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('sample with a deep dip gives 5', () => {
  assert.equal(buildTrace([-3, 2, -3, 4, 2]).result, 5)
})

test('all positive steps still need a start of 1', () => {
  assert.equal(buildTrace([1, 2, 3]).result, 1)
})

test('a single negative value needs 1 - value', () => {
  assert.equal(buildTrace([-5]).result, 6)
})

test('a zero step does not raise the start above 1', () => {
  assert.equal(buildTrace([0, 0]).result, 1)
})

test('random arrays agree with the prefix-checking oracle', () => {
  let state = 3
  const rand = n => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rand(12) }, () => rand(201) - 100)
    assert.equal(buildTrace(nums).result, reference(nums), JSON.stringify(nums))
  }
})

test('every frame is well formed', () => {
  checkFrames(buildTrace([-3, 2, -3, 4, 2]))
})

test('parser rejects malformed arrays and out-of-range values', () => {
  assert.deepEqual(parseInput('[1,-2]'), [1, -2])
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[101]'))
  assert.throws(() => parseInput('[1.5]'))
})
