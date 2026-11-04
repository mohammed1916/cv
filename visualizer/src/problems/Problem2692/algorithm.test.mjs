import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const run = text => buildTrace(parseInput(text)).result

test('2692 error messages match the three cases', () => {
  assert.equal(run('{"obj":{"a":1,"b":{"c":2}},"path":["b","c"],"action":"set"}'), 'Error Modifying: c')
  assert.equal(run('{"obj":{"list":[1,2]},"path":["list",0],"action":"set"}'), 'Error Modifying Index: 0')
  assert.equal(run('{"obj":{"list":[1,2]},"path":["list"],"action":"call","method":"push"}'), 'Error Calling Method: push')
  assert.equal(run('{"obj":{"list":[1,2]},"path":["list"],"action":"call","method":"map"}'), null)
})

test('2692 input validation', () => {
  assert.throws(() => parseInput('{"obj":{"a":1},"path":["zz"],"action":"set"}'))
  assert.throws(() => parseInput('{"obj":{"a":1},"path":["a"],"action":"delete"}'))
})
