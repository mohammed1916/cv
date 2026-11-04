import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = {
  Products: [
    { product_id: 1, category: 'food', price: 1000 },
    { product_id: 2, category: 'toys', price: 250 },
    { product_id: 3, category: 'food', price: 333 },
    { product_id: 4, category: 'books', price: 999 },
  ],
  Discounts: [{ category: 'food', discount: 10 }, { category: 'toys', discount: 15 }],
}

function checkFrames(trace) {
  const pyCount = python.trimEnd().split('\n').length
  assert.ok(trace.frames.length > 0)
  for (const f of trace.frames) {
    assert.ok(phases.some(p => p.id === f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

test('3293 discounted prices keep their exact value', () => {
  const trace = buildTrace(sample)
  // 1000 at 10% off = 900; 250 at 15% off = 212.5; 333 at 10% off = 299.7; 999 with no discount = 999.
  assert.deepEqual(trace.result, [
    { product_id: 1, final_price: 900 },
    { product_id: 2, final_price: 212.5 },
    { product_id: 3, final_price: 299.7 },
    { product_id: 4, final_price: 999 },
  ])
  checkFrames(trace)
})

test('3293 a half unit stays exact', () => {
  const trace = buildTrace({ Products: [{ product_id: 8, category: 'toys', price: 10 }], Discounts: [{ category: 'toys', discount: 25 }] })
  assert.deepEqual(trace.result, [{ product_id: 8, final_price: 7.5 }])
  checkFrames(trace)
})

test('3293 rejects a discount above 100', () => {
  assert.throws(() => parseInput('{"Products":[],"Discounts":[{"category":"x","discount":101}]}'))
})
