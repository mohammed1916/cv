import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1720 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 5)
  assert.ok(python.includes('def decode'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1720 undoes the encoding', () => {
  assert.deepEqual(buildTrace(parseInput('{"encoded":[5,2,7],"first":4}')).result, [4, 1, 3, 4])
  let seed = 141
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 200; t++) {
    const arr = Array.from({ length: 2 + rnd(10) }, () => rnd(64))
    const encoded = arr.slice(1).map((v, i) => arr[i] ^ v)
    assert.deepEqual(buildTrace({ encoded, first: arr[0] }).result, arr)
  }
})

test('1720 rejects invalid input', () => {
  assert.throws(() => parseInput('{"encoded":[],"first":1}'))
  assert.throws(() => parseInput('{"encoded":[1],"first":-1}'))
})
