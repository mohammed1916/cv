import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
  }
}

// Independent oracle: evaluate each prefix exactly with BigInt, which never overflows.
function oracle(bits) {
  let value = 0n
  return bits.map(bit => {
    value = value * 2n + BigInt(bit)
    return value % 5n === 0n
  })
}

test('sample input gives the expected flags', () => {
  assert.deepEqual(buildTrace({ nums: [0, 0, 1, 1, 0] }).result, [true, true, false, false, false])
  assert.deepEqual(buildTrace({ nums: [1] }).result, [false])
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
})

test('seeded random bit strings match the exact BigInt oracle', () => {
  let seed = 1018
  const next = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed >> 16 }
  for (let t = 0; t < 400; t++) {
    const length = 1 + (next() % 24)
    const bits = Array.from({ length }, () => next() % 2)
    const trace = buildTrace({ nums: bits })
    assert.deepEqual(trace.result, oracle(bits), JSON.stringify(bits))
    checkFrames(trace)
  }
})

test('invalid inputs are rejected', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[2]}'))
  assert.throws(() => parseInput('{"nums":[0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]}'))
  assert.throws(() => parseInput('{"bits":[1]}'))
})
