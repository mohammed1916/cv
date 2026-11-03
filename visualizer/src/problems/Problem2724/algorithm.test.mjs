import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

const ids = text => buildTrace(parseInput(text)).result.map(item => item.id)

test('2724 worked examples', () => {
  assert.deepEqual(ids(EXAMPLES[0].input), ['b', 'c', 'a'])
  assert.deepEqual(ids(EXAMPLES[1].input), ['b', 'a', 'c'])
  assert.throws(() => parseInput('{"key":"v","items":[{"v":"x"}]}'))
})
