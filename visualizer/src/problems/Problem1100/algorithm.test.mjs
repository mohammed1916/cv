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

function brute(text, k) {
  let count = 0
  for (let i = 0; i + k <= text.length; i++) {
    if (new Set(text.slice(i, i + k)).size === k) count++
  }
  return count
}

test('sample counts the four all-distinct windows', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.equal(trace.result, 4)
})

test('repeated neighbours and oversized windows', () => {
  assert.equal(run(examples[1].input).result, 2)
  assert.equal(run(examples[2].input).result, 0)
})

test('matches a brute-force window scan on seeded strings', () => {
  let seed = 1100
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(16)
    const text = Array.from({ length }, () => 'abcd'[rnd(4)]).join('')
    const k = 1 + rnd(16)
    const trace = buildTrace({ text, k })
    checkFrames(trace)
    assert.equal(trace.result, brute(text, k), JSON.stringify({ text, k }))
  }
})

test('rejects bad text or k', () => {
  assert.throws(() => parseInput('{"text":"AB","k":2}'))
  assert.throws(() => parseInput('{"text":"ab","k":0}'))
  assert.throws(() => parseInput('{"text":"ab"}'))
})
