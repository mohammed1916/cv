import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: a stable sort by length, then capitalize the first word.
function oracle(sentence) {
  const words = sentence.split(' ').map((w, i) => ({ w: w.toLowerCase(), i }))
  words.sort((a, b) => a.w.length - b.w.length || a.i - b.i)
  const out = words.map(x => x.w)
  out[0] = out[0][0].toUpperCase() + out[0].slice(1)
  return out.join(' ')
}

test('sample sentences', () => {
  assert.equal(solve('Reading books keeps minds bright'), 'Books keeps minds bright reading')
  assert.equal(solve('Tiny cat sat'), 'Cat sat tiny')
  assert.equal(solve('Ant'), 'Ant')
})

test('ties keep the original order', () => {
  assert.equal(solve('Bb aa cc d'), 'D bb aa cc')
})

test('random sentences match the stable-sort oracle', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const letters = 'abcdeAB'
  for (let t = 0; t < 300; t++) {
    const count = 1 + rand(12)
    const words = Array.from({ length: count }, () => Array.from({ length: 1 + rand(6) }, () => letters[rand(letters.length)]).join(''))
    const sentence = words.join(' ')
    assert.equal(solve(sentence), oracle(sentence), sentence)
  }
})

test('frames map to real code and Python lines and end with the result', () => {
  const run = buildTrace('Reading books keeps minds bright')
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid sentences are rejected', () => {
  assert.throws(() => parseInput(''), /1 to 50 words/)
  assert.throws(() => parseInput('two  spaces'), /single spaces/)
  assert.throws(() => parseInput('has 3 digits'), /letters/)
})
