import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, code, parseInput, phases, python } from './algorithm.js'

const row = (name, quantity, price = 1) => ({ name, quantity, price })
const solve = products => buildTrace({ products }).result

test('2887 fills only missing quantities', () => {
  const out = solve([row('Kettle', null, 42), row('Lantern', 7, 18), row('Tent', null, 260)])
  assert.deepEqual(out, [row('Kettle', 0, 42), row('Lantern', 7, 18), row('Tent', 0, 260)])
})

test('2887 keeps an existing zero and a table with no gaps', () => {
  const rows = [row('Rope', 3, 12), row('Stove', 0, 95)]
  assert.deepEqual(solve(rows), rows)
  const run = buildTrace({ products: rows })
  assert.deepEqual(run.frames.at(-1).filled, [])
  assert.ok(run.frames.some(f => f.phase === 'fill' && f.active === -1))
})

test('2887 leaves a missing price alone', () => {
  assert.deepEqual(solve([row('Flask', null, null)]), [row('Flask', 0, null)])
})

test('2887 does not mutate the input', () => {
  const rows = [row('Map', null, 6)]
  buildTrace({ products: rows })
  assert.equal(rows[0].quantity, null)
})

test('2887 oracle: every row satisfies quantity ?? 0 for random tables', () => {
  let seed = 11
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  for (let t = 0; t < 200; t++) {
    const rows = Array.from({ length: 1 + rand(12) }, (_, i) => row(`p${i}`, rand(3) === 0 ? null : rand(5), rand(4) === 0 ? null : rand(100)))
    const out = solve(rows)
    assert.deepEqual(out, rows.map(r => ({ ...r, quantity: r.quantity ?? 0 })))
  }
})

test('2887 parseInput validates', () => {
  assert.deepEqual(parseInput('{"products":[{"name":"A","quantity":null,"price":1}]}').products[0].quantity, null)
  assert.throws(() => parseInput('{"products":[]}'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"products":[{"name":"A","quantity":"x","price":1}]}'))
  assert.throws(() => parseInput('{"products":[{"name":"","quantity":1,"price":1}]}'))
})

test('2887 frames are consistent', () => {
  const run = buildTrace({ products: [row('A', null), row('B', 2), row('C', null)] })
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.message.length > 0)
  }
  assert.equal(run.frames.filter(f => f.phase === 'mask').length, 3)
  assert.equal(run.frames.filter(f => f.phase === 'fill').length, 2)
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).rows, run.result)
})
