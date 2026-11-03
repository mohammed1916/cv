import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const reference = values => [...values].sort((a, b) => {
  const ca = a.toString(2).replace(/0/g, '').length, cb = b.toString(2).replace(/0/g, '').length
  return ca - cb || a - b
})

test('sample values sort by bit count, then by value', () => {
  assert.deepEqual(buildTrace(parseInput('[0,1,2,3,4,5,6,7,8]')).result, [0, 1, 2, 4, 8, 3, 5, 6, 7])
  assert.deepEqual(buildTrace(parseInput('[15,7,3]')).result, [3, 7, 15])
  assert.deepEqual(buildTrace(parseInput('[512,256,1,2,768]')).result, [1, 2, 256, 512, 768])
})

test('random inputs agree with the reference sort', () => {
  let state = 31
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let k = 0; k < 300; k++) {
    const values = Array.from({ length: 1 + rand(16) }, () => rand(1001))
    assert.deepEqual(buildTrace(values).result, reference(values), JSON.stringify(values))
  }
})

test('parse rejects values outside 0 to 1000 and empty arrays', () => {
  assert.throws(() => parseInput('[]'), /1 to 16/)
  assert.throws(() => parseInput('[1001]'), /0 to 1000/)
  assert.throws(() => parseInput('[1.5]'), /whole number/)
})

test('every frame names a real phase, a code line and a Python line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  const run = buildTrace([0, 1, 2, 3, 4, 5, 6, 7, 8])
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
