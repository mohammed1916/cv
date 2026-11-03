import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  assert.equal(run.frames[0].phase, 'start')
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.equal(typeof frame.activeLine, 'number')
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
  }
}

test('1592 examples and metadata are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
  assert.equal(code.length, 7)
  assert.ok(python.includes('def reorderSpaces'))
  assert.equal(Object.keys(pythonLineMap).length, 7)
})

test('1592 keeps words in order, total spaces and length, and spreads gaps evenly', () => {
  let seed = 9
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let trial = 0; trial < 400; trial++) {
    let s = ''
    const pieces = 1 + rnd(6)
    for (let w = 0; w < pieces; w++) {
      s += ' '.repeat(rnd(4))
      s += 'abcdefg'.slice(0, 1 + rnd(4))
    }
    s += ' '.repeat(rnd(3))
    if (!/[a-z]/.test(s)) continue
    const run = buildTrace(parseInput(s))
    const out = run.result
    assert.equal(out.length, s.length, s)
    assert.deepEqual(out.split(' ').filter(Boolean), s.split(' ').filter(Boolean))
    const words = s.split(' ').filter(Boolean)
    if (words.length > 1) {
      const gaps = out.trimEnd().split(/[a-z]+/).filter(x => x.length > 0)
      const sizes = gaps.map(g => g.length)
      assert.ok(sizes.every(x => x === sizes[0]), out)
    }
    checkFrames(run)
  }
})

test('1592 rejects invalid input', () => {
  for (const bad of ['', '   ', 'Hello', 'a-b']) assert.throws(() => parseInput(bad))
})
