import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent reference: try every cap from 0 to the largest element.
function reference({ arr, target }) {
  let best = null
  for (let cap = 0; cap <= Math.max(...arr); cap++) {
    const sum = arr.reduce((s, v) => s + Math.min(v, cap), 0)
    const gap = Math.abs(sum - target)
    if (best === null || gap < best.gap) best = { cap, gap }
  }
  return best.cap
}

test('exact hit at cap 6', () => {
  assert.equal(buildTrace({ arr: [1, 5, 9, 2], target: 14 }).result, 6)
})

test('target above the top sums uses the largest element', () => {
  assert.equal(buildTrace({ arr: [2, 3, 5], target: 100 }).result, 5)
})

test('ties prefer the smaller cap', () => {
  assert.equal(buildTrace({ arr: [7, 7], target: 9 }).result, 4)
})

test('random inputs agree with the exhaustive reference', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const arr = Array.from({ length: 1 + rand(8) }, () => rand(21))
    const target = rand(120)
    assert.equal(buildTrace({ arr, target }).result, reference({ arr, target }), JSON.stringify({ arr, target }))
  }
})

test('every frame names a real phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ arr: [1, 5, 9, 2], target: 14 })
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[1]'), /Use an object/)
  assert.throws(() => parseInput('{"arr":[-1],"target":3}'), /arr is a list/)
  assert.throws(() => parseInput('{"arr":[1],"target":-2}'), /target is an integer/)
})
