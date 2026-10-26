import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('709 official examples', () => {
  assert.equal(buildTrace('Hello').result, 'hello')
  assert.equal(buildTrace('here').result, 'here')
  assert.equal(buildTrace('LOVELY').result, 'lovely')
})

test('709 every printable ASCII character matches toLowerCase on ASCII', () => {
  for (let code = 32; code <= 126; code++) {
    const ch = String.fromCharCode(code)
    assert.equal(buildTrace(ch).result, ch.toLowerCase(), ch)
  }
  assert.equal(buildTrace('AaZz@[`{').result, 'aazz@[`{')
})

test('709 rejects non-ASCII input', () => {
  assert.throws(() => parseInput('"é"'))
})
