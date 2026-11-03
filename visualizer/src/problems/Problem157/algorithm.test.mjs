import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

test('own sample reads return the first n characters', () => {
  assert.equal(buildTrace({ file: 'rhythm', n: 4 }).result, 'rhyt')
  assert.equal(buildTrace({ file: 'stonefish', n: 6 }).result, 'stonef')
})

test('a request longer than the file stops at the end of the file', () => {
  assert.equal(buildTrace({ file: 'ab', n: 5 }).result, 'ab')
  assert.equal(buildTrace({ file: '', n: 3 }).result, '')
})

test('zero characters requested gives an empty answer', () => {
  assert.equal(buildTrace({ file: 'abc', n: 0 }).result, '')
})

test('random files and sizes match the file prefix', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const file = Array.from({ length: rand(21) }, () => 'abcdefghijklmnopqrstuvwxyz'[rand(26)]).join('')
    const n = rand(31)
    assert.equal(buildTrace({ file, n }).result, file.slice(0, n), `${file} ${n}`)
  }
})

test('every frame names a real code line, a Python line and a known phase', () => {
  const run = buildTrace({ file: 'stonefish', n: 9 })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
    assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('parseInput rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"file":"AB","n":2}'), /lowercase/)
  assert.throws(() => parseInput('{"file":"ab","n":31}'), /0 to 30/)
})
