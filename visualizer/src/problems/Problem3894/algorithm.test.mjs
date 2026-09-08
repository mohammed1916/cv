import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
test('3894 every allowed timer and short-circuit trace', () => {
  const expected = new Map([[0, 'Green'], [30, 'Orange']])
  for (let t = 31; t <= 90; t++) expected.set(t, 'Red')
  for (let timer = 0; timer <= 1000; timer++) {
    const run = buildTrace(parseInput(String(timer)))
    assert.equal(run.result, expected.get(timer) || 'Invalid')
    const checked = timer === 0 ? 1 : timer === 30 ? 2 : 3
    assert.equal(run.frames.length, checked + 2)
    assert.equal(run.frames.at(-1).checked, checked)
    assert.equal(run.frames.at(-1).result, run.result)
    assert.equal(run.input, timer)
  }
})
test('3894 malformed timers are rejected, not classified as Invalid', () => {
  for (const data of [null, true, '60', [], {}, -1, 1001, 1.5]) assert.throws(() => parseInput(JSON.stringify(data)))
  assert.equal(buildTrace(parseInput('5')).result, 'Invalid')
})
