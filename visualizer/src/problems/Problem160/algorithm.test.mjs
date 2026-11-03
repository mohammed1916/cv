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

test('160 examples and metadata are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
  assert.equal(code.length, 6)
  assert.ok(python.includes('def getIntersectionNode'))
  assert.equal(Object.keys(pythonLineMap).length, 6)
})

test('160 finds the shared tail, or null when the lists are disjoint', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  const list = () => Array.from({ length: rnd(6) }, () => rnd(100))
  for (let trial = 0; trial < 300; trial++) {
    const a = list()
    const b = list()
    const tail = list()
    const run = buildTrace(parseInput(JSON.stringify({ a, b, tail })))
    const expected = tail.length ? 't0' : 'null'
    assert.equal(run.result, expected, JSON.stringify({ a, b, tail }))
    checkFrames(run)
  }
})

test('160 walks each pointer at most once per list', () => {
  const run = buildTrace({ a: [1, 2, 3], b: [4], tail: [5, 6] })
  const last = run.frames.at(-2).snapshot
  // Lists hold 5 and 3 nodes, so the pointers meet within 5 + 3 counted moves each.
  assert.ok(last.stepsA <= 8 && last.stepsB <= 8)
  assert.equal(run.result, 't0')
})

test('160 rejects invalid input', () => {
  for (const bad of ['{"a":[1],"b":[2]}', '{"a":[100],"b":[],"tail":[]}', '{"a":"x","b":[],"tail":[]}']) assert.throws(() => parseInput(bad))
})
