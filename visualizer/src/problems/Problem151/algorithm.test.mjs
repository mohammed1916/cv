import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: split on spaces, drop empty pieces, reverse, and join.
const oracle = s => s.split(' ').filter(w => w.length > 0).reverse().join(' ')

test('extra spaces are removed and word order is reversed', () => {
  assert.equal(buildTrace('  the sky  is blue ').result, 'blue is sky the')
})

test('a single word is unchanged apart from trimming', () => {
  assert.equal(buildTrace('   hello   ').result, 'hello')
})

test('random strings agree with the split-and-join oracle', () => {
  let seed = 17
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  const alphabet = 'ab c'
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(40)
    let s = ''
    for (let i = 0; i < len; i++) s += alphabet[rnd(alphabet.length)]
    if (!/[^ ]/.test(s)) continue
    assert.equal(buildTrace(s).result, oracle(s), JSON.stringify(s))
  }
})

test('parseInput rejects long, non-ASCII, and all-space input', () => {
  assert.equal(parseInput('a b'), 'a b')
  assert.throws(() => parseInput('x'.repeat(61)), /60 characters/)
  assert.throws(() => parseInput('café'), /ASCII/)
  assert.throws(() => parseInput('   '), /non-space/)
})

test('every frame names a real phase and in-range code lines', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace('one  two three')
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length - 1)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
