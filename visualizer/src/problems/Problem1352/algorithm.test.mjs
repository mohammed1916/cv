import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = operations => buildTrace(parseInput(JSON.stringify({ operations }))).result

test('1352 a zero in the stream makes older products zero', () => {
  const ops = [['add', 3], ['add', 0], ['add', 2], ['add', 5], ['add', 4], ['getProduct', 2], ['getProduct', 3], ['getProduct', 4], ['add', 8], ['getProduct', 2]]
  assert.deepEqual(solve(ops), [20, 40, 0, 32])
})

test('1352 a single value is its own product', () => {
  assert.deepEqual(solve([['add', 7], ['getProduct', 1]]), [7])
})

test('1352 rejects getProduct with k above the stream size', () => {
  assert.throws(() => parseInput('{"operations":[["add",2],["getProduct",2]]}'))
})

// Independent oracle: keep the whole stream and multiply the last k values directly.
function oracle(operations) {
  const stream = []
  const out = []
  for (const [name, value] of operations) {
    if (name === 'add') stream.push(value)
    else {
      let product = 1
      for (let i = stream.length - value; i < stream.length; i++) product *= stream[i]
      out.push(product)
    }
  }
  return out
}

test('1352 seeded random operation lists match a direct-product oracle', () => {
  let seed = 1352
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const operations = []
    let size = 0
    const count = 1 + rnd(12)
    for (let i = 0; i < count; i++) {
      if (size === 0 || rnd(2) === 0) { operations.push(['add', rnd(10)]); size++ }
      else operations.push(['getProduct', 1 + rnd(size)])
    }
    assert.deepEqual(solve(operations), oracle(operations), JSON.stringify(operations))
  }
})
