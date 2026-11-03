import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function reference(logs) {
  let depth = 0
  for (const log of logs) {
    if (log === '../') depth = Math.max(0, depth - 1)
    else if (log !== './') depth += 1
  }
  return depth
}

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

test('1598 examples and metadata are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
  assert.equal(code.length, 6)
  assert.ok(python.includes('def finalDepth'))
  assert.equal(Object.keys(pythonLineMap).length, 6)
})

test('1598 matches the reference on random logs', () => {
  let seed = 13
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  const tokens = ['a/', 'bc/', '../', './']
  for (let trial = 0; trial < 400; trial++) {
    const logs = Array.from({ length: 1 + rnd(15) }, () => tokens[rnd(tokens.length)])
    const run = buildTrace(parseInput(JSON.stringify(logs)))
    assert.equal(run.result, reference(logs), JSON.stringify(logs))
    checkFrames(run)
  }
})

test('1598 rejects invalid input', () => {
  for (const bad of ['[]', '["a/b"]', '"a/"', '[1]', '["../","x"]']) assert.throws(() => parseInput(bad))
})
