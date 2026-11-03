import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const pivot = text => buildTrace(parseInput(text)).result

test('2252 pivots three products over fixed store columns', () => {
  assert.deepEqual(pivot('{"rows":[[101,"north",40],[101,"west",55],[102,"south",18],[103,"north",7],[103,"south",9]]}'), [
    { product_id: 101, north: 40, south: null, west: 55 },
    { product_id: 102, north: null, south: 18, west: null },
    { product_id: 103, north: 7, south: 9, west: null },
  ])
})

test('2252 a single row leaves the other store columns NULL', () => {
  assert.deepEqual(pivot('{"rows":[[7,"west",3]]}'), [
    { product_id: 7, north: null, south: null, west: 3 },
  ])
})

test('2252 rejects unknown stores and duplicate product-store pairs', () => {
  assert.throws(() => parseInput('{"rows":[[1,"east",2]]}'))
  assert.throws(() => parseInput('{"rows":[[1,"north",2],[1,"north",5]]}'))
})
