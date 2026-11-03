import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"users":[{"account":310001,"name":"Rhea"},{"account":310002,"name":"Omar"},{"account":310003,"name":"Lena"},{"account":310004,"name":"Tomas"}],"transactions":[{"trans_id":1,"account":310001,"amount":6000,"transacted_on":"2020-08-01"},{"trans_id":2,"account":310001,"amount":5000,"transacted_on":"2020-09-01"},{"trans_id":3,"account":310001,"amount":-2000,"transacted_on":"2020-09-02"},{"trans_id":4,"account":310002,"amount":1500,"transacted_on":"2020-01-20"},{"trans_id":5,"account":310002,"amount":2500,"transacted_on":"2020-08-25"},{"trans_id":6,"account":310003,"amount":12000,"transacted_on":"2020-06-01"},{"trans_id":7,"account":310004,"amount":15000,"transacted_on":"2020-07-01"},{"trans_id":8,"account":310001,"amount":1500,"transacted_on":"2020-10-01"}]}'
const EXPECTED = [
  { name: 'Rhea', balance: 10500 },
  { name: 'Lena', balance: 12000 },
  { name: 'Tomas', balance: 15000 },
]

test('1587 keeps only balances strictly above 10000', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1587 frame invariants hold', () => {
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

test('1587 an exact 10000 total is excluded', () => {
  const { result } = buildTrace(parseInput('{"users":[{"account":1,"name":"X"}],"transactions":[{"trans_id":1,"account":1,"amount":10000}]}'))
  assert.deepEqual(result, [])
})
