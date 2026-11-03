import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = command => buildTrace(command).result

test('sample tokens are interpreted in order', () => {
  assert.equal(solve('()G(al)G'), 'oGalG')
  assert.equal(solve('G(al)()'), 'Galo')
  assert.equal(solve('(al)'), 'al')
})

test('a command of only G tokens is returned as is', () => {
  assert.equal(solve('GGG'), 'GGG')
})

// Independent oracle: replace the two multi-character tokens in order, which is valid because they never overlap.
test('random token sequences agree with a replace-based oracle', () => {
  let seed = 29
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  const tokens = ['G', '()', '(al)']
  for (let t = 0; t < 300; t++) {
    const command = Array.from({ length: 1 + rnd(12) }, () => tokens[rnd(3)]).join('')
    const expected = command.replaceAll('()', 'o').replaceAll('(al)', 'al')
    assert.equal(solve(command), expected, command)
  }
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('"G(a)"'), /tokens/)
  assert.throws(() => parseInput('"Gx"'), /tokens/)
  assert.throws(() => parseInput('""'), /tokens/)
})

test('every frame names a real phase and lines inside the code and Python listings', () => {
  const ids = new Set(phases.map(p => p.id))
  const codeLines = code.length, pyLines = python.split('\n').length
  for (const frame of buildTrace('()G(al)G').frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
})
