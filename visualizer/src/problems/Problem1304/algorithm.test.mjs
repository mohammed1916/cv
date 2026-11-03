import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

function checkAnswer(n) {
  const values = buildTrace(n).result
  assert.equal(values.length, n, `length for n=${n}`)
  assert.equal(new Set(values).size, n, `distinct for n=${n}`)
  assert.equal(values.reduce((s, v) => s + v, 0), 0, `sum for n=${n}`)
}

test('n = 5 gives five distinct integers summing to zero', () => {
  assert.deepEqual(buildTrace(5).result, [1, -1, 2, -2, 0])
})

test('every n from 1 to 50 meets the requirements', () => {
  for (let n = 1; n <= 50; n++) checkAnswer(n)
})

test('every frame names a real phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace(7)
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('0'), /from 1 to 50/)
  assert.throws(() => parseInput('2.5'), /integer n/)
  assert.throws(() => parseInput('"3"'), /integer n/)
})
