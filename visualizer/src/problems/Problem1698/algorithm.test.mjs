import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1698 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 8)
  assert.ok(python.includes('def countDistinct'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1698 matches a set of all substrings', () => {
  assert.equal(buildTrace('abab').result, 7)
  assert.equal(buildTrace('abcd').result, 10)
  assert.equal(buildTrace('aaa').result, 3)
  let seed = 71
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 200; t++) {
    const s = Array.from({ length: 1 + rnd(10) }, () => 'abc'[rnd(3)]).join('')
    const set = new Set()
    for (let i = 0; i < s.length; i++) for (let j = i + 1; j <= s.length; j++) set.add(s.slice(i, j))
    assert.equal(buildTrace(s).result, set.size, s)
  }
})

test('1698 rejects invalid input', () => {
  assert.throws(() => parseInput('""'))
  assert.throws(() => parseInput('"AB"'))
})
