import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const LETTERS = 'QWER'

// Independent oracle: a window can be replaced exactly when every letter outside it is within the target.
function oracle(s) {
  const n = s.length
  const k = n / 4
  const whole = Object.fromEntries([...LETTERS].map(c => [c, 0]))
  for (const ch of s) whole[ch] += 1
  if ([...LETTERS].every(c => whole[c] <= k)) return 0
  let best = n
  for (let l = 0; l < n; l++) {
    for (let r = l; r < n; r++) {
      const outside = Object.fromEntries([...LETTERS].map(c => [c, 0]))
      for (let i = 0; i < n; i++) if (i < l || i > r) outside[s[i]] += 1
      if ([...LETTERS].every(c => outside[c] <= k)) best = Math.min(best, r - l + 1)
    }
  }
  return best
}

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.message.length > 10)
  }
}

test('the balanced sample needs no replacement', () => {
  const trace = buildTrace(parseInput(examples[0].input))
  checkFrames(trace)
  assert.equal(trace.result, 0)
})

test('heavy Q and all-Q samples match the oracle', () => {
  assert.equal(buildTrace(parseInput(examples[1].input)).result, oracle(examples[1].input))
  const allQ = buildTrace(parseInput(examples[2].input))
  checkFrames(allQ)
  assert.equal(allQ.result, 6)
})

test('every string of length 4 and 8 over QWER matches the oracle', () => {
  const letters = [...LETTERS]
  for (const n of [4, 8]) {
    const total = letters.length ** n
    for (let code = 0; code < total; code++) {
      let s = ''
      let value = code
      for (let i = 0; i < n; i++) { s += letters[value % 4]; value = Math.floor(value / 4) }
      const trace = buildTrace(parseInput(s))
      assert.equal(trace.result, oracle(s), s)
    }
  }
})

test('random strings of length 12 and 16 match the oracle', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = rand(2) ? 12 : 16
    let s = ''
    for (let i = 0; i < n; i++) s += LETTERS[rand(4)]
    assert.equal(buildTrace(parseInput(s)).result, oracle(s), s)
  }
})

test('invalid strings are rejected', () => {
  assert.throws(() => parseInput('QWE'))
  assert.throws(() => parseInput('QWEX'))
  assert.throws(() => parseInput('QQQQQ'))
  assert.throws(() => parseInput('QQQQ'.repeat(7)))
})
