import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent reference: for each position, scan the suffix directly.
function reference(arr) {
  return arr.map((_, i) => (i + 1 < arr.length ? Math.max(...arr.slice(i + 1)) : -1))
}

test('mixed example', () => {
  assert.deepEqual(buildTrace([3, 9, 2, 7]).result, [9, 7, 7, -1])
})

test('all negative example', () => {
  assert.deepEqual(buildTrace([-4, -2, -7]).result, [-2, -7, -1])
})

test('single element becomes -1 and input is not mutated', () => {
  const input = [5]
  assert.deepEqual(buildTrace(input).result, [-1])
  assert.deepEqual(input, [5])
})

test('random arrays agree with the suffix-scan reference', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 1 + rand(12) }, () => rand(41) - 20)
    assert.deepEqual(buildTrace(arr).result, reference(arr), JSON.stringify(arr))
  }
})

test('every frame names a real phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([3, 9, 2, 7])
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('{"a":1}'), /JSON array/)
  assert.throws(() => parseInput('[1.5]'), /integers/)
  assert.throws(() => parseInput('[]'), /1 to 30/)
})
