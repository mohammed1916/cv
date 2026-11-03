import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Checks the properties the answer must have, rather than one fixed output.
function checkAnswer(input, output) {
  assert.equal(output.length, input.length)
  assert.ok(!output.includes('?'), 'no ? remains')
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== '?') assert.equal(output[i], input[i], `fixed letter at ${i} changed`)
    else assert.ok('abc'.includes(output[i]), `replacement at ${i} is a, b or c`)
    if (i > 0) assert.notEqual(output[i], output[i - 1], `neighbours ${i - 1} and ${i} match`)
  }
}

test('own sample strings produce valid answers', () => {
  for (const s of ['a?b??c', '???', 'ab?c?d']) checkAnswer(s, buildTrace(s).result)
})

test('a lone ? next to a fixed letter avoids that letter', () => {
  assert.equal(buildTrace('a?').result[1], 'b')
})

test('random valid strings always produce valid answers', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  let checked = 0
  for (let t = 0; t < 400 && checked < 200; t++) {
    const s = Array.from({ length: 1 + rand(12) }, () => 'abc?'[rand(4)]).join('')
    try { parseInput(JSON.stringify(s)) } catch { continue }
    checkAnswer(s, buildTrace(s).result)
    checked++
  }
  assert.ok(checked > 50)
})

test('every frame names a real code line, a Python line and a known phase', () => {
  const run = buildTrace('a?b??c')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
    assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('parseInput rejects repeated fixed letters and bad characters', () => {
  assert.throws(() => parseInput('"aa?"'), /repeat/)
  assert.throws(() => parseInput('"A?"'), /lowercase/)
})
