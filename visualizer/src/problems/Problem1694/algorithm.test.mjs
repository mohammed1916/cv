import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, pythonLineMap } from './algorithm.js'

// Independent formulation: the number of three-digit blocks is floor((n - 2) / 3);
// the remainder is 2, 3 or 4 digits and four digits split into two pairs.
function oracle(digits) {
  const n = digits.length
  const threes = Math.floor((n - 2) / 3)
  const rest = n - threes * 3
  const parts = []
  let at = 0
  for (let k = 0; k < threes; k++) { parts.push(digits.slice(at, at + 3)); at += 3 }
  if (rest === 4) parts.push(digits.slice(at, at + 2), digits.slice(at + 2))
  else parts.push(digits.slice(at))
  return parts.join('-')
}

function randomDigits(length, seed) {
  let state = seed
  let out = ''
  for (let i = 0; i < length; i++) {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    out += String(state % 10)
  }
  return out
}

test('1694 every digit length from 2 to 100 matches the block oracle', () => {
  for (let n = 2; n <= 100; n++) {
    const digits = randomDigits(n, n * 7919)
    const run = buildTrace(parseInput(JSON.stringify(digits)))
    assert.equal(run.result, oracle(digits), `length ${n}`)
    assert.equal(run.frames.at(-1).snapshot.result, run.result)
  }
})

test('1694 separators are ignored and do not change the digits', () => {
  const run = buildTrace(parseInput(JSON.stringify('1-23-45 6')))
  assert.equal(run.result, '123-456')
  assert.equal(run.frames[0].snapshot.digits, '123456')
})

test('1694 frames carry phase, pseudocode line, message and snapshot', () => {
  const run = buildTrace('"12345"')
  const phases = new Set(run.frames.map(frame => frame.phase))
  assert.ok(['start', 'take', 'finish', 'done'].every(phase => phases.has(phase)))
  for (const frame of run.frames) {
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.message.length > 0)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.snapshot && typeof frame.snapshot === 'object')
  }
  for (let line = 1; line <= code.length; line++) assert.ok(pythonLineMap[line] >= 1)
})

test('1694 invalid input is rejected', () => {
  for (const text of ['"1"', '"12a"', '12', '[1,2]', '""', JSON.stringify('1'.repeat(101)), 'nope']) {
    assert.throws(() => parseInput(text))
  }
})
