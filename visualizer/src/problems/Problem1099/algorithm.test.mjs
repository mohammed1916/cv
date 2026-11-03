import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
  }
}

function brute(values, limit) {
  let best = -1
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      const total = values[i] + values[j]
      if (total < limit && total > best) best = total
    }
  }
  return best
}

test('sample keeps the largest pair sum below the limit', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.equal(trace.result, 9)
})

test('a sum equal to the limit is not accepted', () => {
  assert.equal(run('{"values":[3,7],"limit":10}').result, -1)
  assert.equal(run('{"values":[3,6],"limit":10}').result, 9)
})

test('single values and oversized pairs return -1', () => {
  assert.equal(run(examples[1].input).result, -1)
  assert.equal(run(examples[2].input).result, -1)
})

test('matches a brute-force pair search on seeded inputs', () => {
  let seed = 1099
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(12)
    const values = Array.from({ length: size }, () => 1 + rnd(60))
    const limit = 2 + rnd(90)
    const trace = buildTrace({ values, limit })
    checkFrames(trace)
    assert.equal(trace.result, brute(values, limit), JSON.stringify({ values, limit }))
  }
})

test('rejects malformed or out-of-range input', () => {
  assert.throws(() => parseInput('{"values":[1,2]}'))
  assert.throws(() => parseInput('{"values":[1.5,2],"limit":5}'))
  assert.throws(() => parseInput('{"values":[],"limit":5}'))
  assert.throws(() => parseInput('{"values":[1,2],"limit":1}'))
})
