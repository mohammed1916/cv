import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(p => p.id))
const PY_COUNT = python.split('\n').length

function solve(text) {
  return buildTrace(parseInput(JSON.stringify(text))).result
}

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= PY_COUNT)
    assert.equal(typeof frame.message, 'string')
  }
}

test('3749 presets', () => {
  assert.equal(solve('add(1,mul(2,-3))'), -5)
  assert.equal(solve('div(sub(10,4),3)'), 2)
  assert.equal(solve('sub(mul(-2,add(3,4)),div(12,-4))'), -11)
})

test('3749 a bare literal and exact division', () => {
  assert.equal(solve('-42'), -42)
  assert.equal(solve('div(-21,7)'), -3)
})

// Independent oracle: build random valid expressions alongside their values.
test('3749 random expressions match their construction value', () => {
  let seed = 3749
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const gen = depth => {
    if (depth === 0 || rnd(3) === 0) {
      const v = rnd(19) - 9
      return { text: String(v), value: v }
    }
    const pick = rnd(4)
    const a = gen(depth - 1)
    const b = gen(depth - 1)
    if (pick === 0) return { text: `add(${a.text},${b.text})`, value: a.value + b.value }
    if (pick === 1) return { text: `sub(${a.text},${b.text})`, value: a.value - b.value }
    if (pick === 2) return { text: `mul(${a.text},${b.text})`, value: a.value * b.value }
    const d = rnd(8) + 1
    const sign = rnd(2) ? d : -d
    return { text: `div(mul(${a.text},${sign}),${sign})`, value: a.value }
  }
  for (let t = 0; t < 300; t += 1) {
    const { text, value } = gen(3)
    assert.equal(solve(text), value, text)
  }
})

test('3749 frames carry valid pseudocode and python lines', () => {
  checkFrames(buildTrace(parseInput('"add(1,mul(2,-3))"')))
})

test('3749 rejects malformed expressions', () => {
  assert.throws(() => buildTrace('add(1,2'))
  assert.throws(() => buildTrace('add(1 2)'))
  assert.throws(() => buildTrace('div(1,0)'))
  assert.throws(() => buildTrace('1 2'))
  assert.throws(() => parseInput('"add(1,2)$"'))
})
