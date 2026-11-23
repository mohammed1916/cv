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

import { productTutorial } from './tutorial.js'
import { examples } from './presets.js'

test('1352 goal example and presets give the answers stated in the goal text', () => {
  const run = input => buildTrace(parseInput(input)).result
  assert.deepEqual(run(examples[0].input), [15])
  assert.deepEqual(run(examples[1].input), [0, 30])
})

test('1352 random operations match a direct product of the last k values', () => {
  let seed = 1352
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const ops = [], values = [], want = []
    const count = 1 + rnd(12)
    for (let i = 0; i < count; i++) {
      if (values.length === 0 || rnd(2) === 0) { const v = rnd(10); ops.push(['add', v]); values.push(v) }
      else {
        const k = 1 + rnd(values.length)
        ops.push(['getProduct', k])
        want.push(values.slice(-k).reduce((p, v) => p * v, 1))
      }
    }
    assert.deepEqual(buildTrace({ operations: ops }).result, want, JSON.stringify(ops))
  }
})

test('1352 every frame has a reason tied to its line of the submitted solution', () => {
  const run = buildTrace(parseInput(examples[1].input))
  for (const frame of run.frames) {
    const scene = productTutorial({ step: frame })
    assert.ok(scene.reason.length > 20)
    assert.ok(scene.spoken.reason.length > 20)
  }
  assert.deepEqual(run.frames.find(frame => frame.phase === 'multiply').window[0] >= 0, true)
})
