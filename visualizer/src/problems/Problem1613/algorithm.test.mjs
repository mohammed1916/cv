import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"customers":[{"customer_id":7,"customer_name":"Ana"},{"customer_id":1,"customer_name":"Ben"},{"customer_id":4,"customer_name":"Cy"},{"customer_id":2,"customer_name":"Dee"}]}'
const EXPECTED = [{ ids: 3 }, { ids: 5 }, { ids: 6 }]

test('1613 lists the gaps up to the largest id', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1613 frame invariants hold', () => {
  const { frames } = buildTrace(parseInput(SAMPLE))
  const ids = new Set(phases.map(p => p.id))
  const pyCount = python.split('\n').length
  assert.ok(frames.length > 0)
  for (const f of frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.output))
  }
  assert.equal(frames.at(-1).phase, 'done')
  assert.deepEqual(frames.at(-1).output, EXPECTED)
})

test('1613 a contiguous table has no missing ids', () => {
  assert.deepEqual(buildTrace(parseInput('{"customers":[{"customer_id":1},{"customer_id":2}]}')).result, [])
})
