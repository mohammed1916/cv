import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1716 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 6)
  assert.ok(python.includes('def totalMoney'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1716 matches the weekly closed form', () => {
  assert.equal(buildTrace(5).result, 15)
  assert.equal(buildTrace(9).result, 28 + 2 + 3)
  for (let n = 1; n <= 200; n++) {
    const w = Math.floor(n / 7), r = n % 7
    const closed = 28 * w + 7 * (w * (w - 1)) / 2 + (r * (r + 1)) / 2 + r * w
    assert.equal(buildTrace(n).result, closed, `n=${n}`)
  }
})

test('1716 rejects invalid input', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('1001'))
})
