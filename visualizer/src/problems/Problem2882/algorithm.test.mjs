import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const row = (customer_id, email, name = `n${customer_id}`) => ({ customer_id, name, email })
const ids = customers => buildTrace({ customers }).result.map(r => r.customer_id)

test('2882 hand-computed cases', () => {
  assert.deepEqual(ids([row(101, 'a'), row(102, 'b'), row(103, 'a'), row(104, 'c'), row(105, 'b'), row(106, 'a')]), [101, 102, 104])
  assert.deepEqual(ids([row(1, 'x'), row(2, 'y'), row(3, 'z')]), [1, 2, 3])
  assert.deepEqual(ids([row(5, 'q'), row(4, 'q'), row(3, 'q')]), [5])
  assert.deepEqual(ids([]), [])
})

test('2882 keeps the first row by position, not the smallest id', () => {
  assert.deepEqual(ids([row(9, 'm'), row(1, 'm')]), [9])
})

test('2882 compares emails exactly and ignores names and ids', () => {
  assert.deepEqual(ids([row(1, 'A@x.test'), row(2, 'a@x.test')]), [1, 2])
  assert.deepEqual(ids([row(1, 'm', 'Same'), row(2, 'n', 'Same')]), [1, 2])
  assert.deepEqual(ids([row(1, 'm'), row(1, 'n')]), [1, 1])
})

test('2882 parseInput validates the table', () => {
  assert.equal(parseInput('{"customers":[]}').customers.length, 0)
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"customers":[{"customer_id":"1","name":"a","email":"b"}]}'))
  assert.throws(() => parseInput('{"customers":[{"customer_id":1,"name":"a","email":""}]}'))
  assert.throws(() => parseInput(JSON.stringify({ customers: Array.from({ length: 15 }, (_, i) => row(i, 'e')) })))
})

test('2882 random tables match an earlier-index oracle', () => {
  let seed = 2882
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const customers = Array.from({ length: rnd(14) }, (_, i) => row(i, `e${rnd(5)}`))
    const emails = customers.map(c => c.email)
    const expected = customers.filter((c, i) => emails.indexOf(c.email) === i)
    assert.deepEqual(buildTrace({ customers }).result, expected)
  }
})

test('2882 frames expose decisions, the colliding row and real lines', () => {
  const customers = [row(1, 'a'), row(2, 'a'), row(3, 'b')]
  const { frames } = buildTrace({ customers })
  const pyLines = python.trim().split('\n')
  const phaseIds = new Set(phases.map(p => p.id))
  for (const f of frames) {
    assert.ok(phaseIds.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pyLines[f.pythonLine - 1].trim().length > 0)
    assert.equal(f.decisions.length, 3)
    assert.ok(f.message.length > 0)
  }
  const drop = frames.find(f => f.phase === 'drop')
  assert.equal(drop.at, 1)
  assert.equal(drop.firstRow, 0)
  assert.ok(pyLines[drop.pythonLine - 1].includes('False'))
  assert.deepEqual(frames.at(-1).decisions, ['keep', 'drop', 'keep'])
  assert.deepEqual(frames.at(-1).hash.maps[0].entries, [['a', 0], ['b', 2]])
  assert.deepEqual(frames.find(f => f.phase === 'lookup' && f.at === 1).hash.ops.map(o => o.hit), [true])
})
