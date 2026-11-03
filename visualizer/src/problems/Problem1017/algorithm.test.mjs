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

// Independent check: a digit string is valid when every digit is 0 or 1, it has no leading zero
// unless it is "0", and its value in base negative two (computed with BigInt) equals n.
function valueOf(digits) {
  let total = 0n
  let weight = 1n
  for (const digit of [...digits].reverse()) {
    total += BigInt(digit) * weight
    weight *= -2n
  }
  return total
}

function assertValidRepresentation(n, digits) {
  assert.match(digits, /^[01]+$/)
  if (digits !== '0') assert.notEqual(digits[0], '0', `leading zero in ${digits}`)
  assert.equal(valueOf(digits), BigInt(n), `n=${n} digits=${digits}`)
}

test('sample inputs match hand-checked representations', () => {
  assert.equal(buildTrace({ n: 0 }).result, '0')
  assert.equal(buildTrace({ n: 1 }).result, '1')
  assert.equal(buildTrace({ n: 2 }).result, '110')
  assert.equal(buildTrace({ n: 4 }).result, '100')
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
})

test('every n from 0 to 2000 has a valid base negative two representation', () => {
  for (let n = 0; n <= 2000; n++) {
    const trace = buildTrace({ n })
    assertValidRepresentation(n, trace.result)
    checkFrames(trace)
  }
})

test('large values also round-trip', () => {
  for (const n of [999999, 1000000, 524287, 65536]) {
    assertValidRepresentation(n, buildTrace({ n }).result)
  }
})

test('invalid inputs are rejected', () => {
  assert.throws(() => parseInput('{"n":-1}'))
  assert.throws(() => parseInput('{"n":1000001}'))
  assert.throws(() => parseInput('{"n":1.5}'))
})
