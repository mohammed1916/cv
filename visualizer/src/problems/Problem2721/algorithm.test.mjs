import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

const run = text => buildTrace(parseInput(text)).result

test('2721 worked examples', () => {
  assert.deepEqual(run(EXAMPLES[0].input), { ok: true, values: ['a-done', 'b-done', 'c-done'] })
  assert.deepEqual(run(EXAMPLES[1].input), { ok: false, error: 'b' })
  assert.throws(() => parseInput('[]'))
})
