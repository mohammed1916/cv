import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'group', 'done'])

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(PHASES.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.columns))
  }
  assert.deepEqual(run.frames.at(-1).rows, run.result)
}

test('1445 subtracts oranges from apples per date, in date order', () => {
  const run = buildTrace(parseInput(JSON.stringify({ Sales: [
    { sale_date: '2020-06-01', fruit: 'apples', sold_num: 15 },
    { sale_date: '2020-05-30', fruit: 'oranges', sold_num: 8 },
    { sale_date: '2020-06-02', fruit: 'oranges', sold_num: 5 },
    { sale_date: '2020-05-30', fruit: 'apples', sold_num: 10 },
    { sale_date: '2020-06-01', fruit: 'oranges', sold_num: 15 },
    { sale_date: '2020-06-02', fruit: 'apples', sold_num: 20 },
  ] })))
  assert.deepEqual(run.result, [
    { sale_date: '2020-05-30', diff: 2 },
    { sale_date: '2020-06-01', diff: 0 },
    { sale_date: '2020-06-02', diff: 15 },
  ])
  checkFrames(run)
})

test('1445 a date with only oranges gives a negative difference', () => {
  const run = buildTrace(parseInput('{"Sales":[{"sale_date":"2021-01-01","fruit":"oranges","sold_num":4}]}'))
  assert.deepEqual(run.result, [{ sale_date: '2021-01-01', diff: -4 }])
  checkFrames(run)
})

test('1445 rejects an unknown fruit', () => {
  assert.throws(() => parseInput('{"Sales":[{"sale_date":"2021-01-01","fruit":"pears","sold_num":1}]}'))
})
