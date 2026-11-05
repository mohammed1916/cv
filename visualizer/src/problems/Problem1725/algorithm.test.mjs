import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1725 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 7)
  assert.ok(python.includes('def countGoodRectangles'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1725 counts the rectangles with the largest square side', () => {
  assert.equal(buildTrace(parseInput(examples[0].input)).result, 2)
  assert.equal(buildTrace(parseInput(examples[1].input)).result, 1)
  let seed = 171
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 200; t++) {
    const rects = Array.from({ length: 1 + rnd(8) }, () => [1 + rnd(6), 1 + rnd(6)])
    const best = Math.max(...rects.map(([w, h]) => Math.min(w, h)))
    assert.equal(buildTrace(rects).result, rects.filter(([w, h]) => Math.min(w, h) === best).length)
  }
})

test('1725 rejects invalid input', () => {
  assert.throws(() => parseInput('[[0,1]]'))
})
