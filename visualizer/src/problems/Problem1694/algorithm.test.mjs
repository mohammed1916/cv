import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1694 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 10)
  assert.ok(python.includes('def reformatNumber'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1694 produces blocks of 3 with a tail of 2 or 2+2, never a single digit', () => {
  for (let n = 2; n <= 40; n++) {
    const digits = Array.from({ length: n }, (_, i) => String(i % 10)).join('')
    const grouped = buildTrace(parseInput(JSON.stringify(digits))).result
    const blocks = grouped.split('-')
    assert.equal(blocks.join(''), digits)
    assert.ok(blocks.every(b => b.length >= 2 && b.length <= 3))
    assert.ok(blocks.filter(b => b.length === 2).length <= 2)
  }
  assert.equal(buildTrace(parseInput(JSON.stringify('3 1-41 59'))).result, '314-159')
  assert.equal(buildTrace(parseInput(JSON.stringify('12-34 5'))).result, '123-45')
})

test('1694 rejects invalid input', () => {
  assert.throws(() => parseInput('"1"'))
  assert.throws(() => parseInput('"12a"'))
})
