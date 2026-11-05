import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1636 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 4)
  assert.ok(python.includes('def frequencySort'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1636 orders by frequency then larger value first', () => {
  assert.deepEqual(buildTrace(parseInput('[5,5,7,9,9,9,4]')).result, [7, 4, 5, 5, 9, 9, 9])
  assert.deepEqual(buildTrace(parseInput('[3,1,2]')).result, [3, 2, 1])
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(7) - 3)
    const freq = v => nums.filter(x => x === v).length
    const expected = [...nums].sort((a, b) => freq(a) - freq(b) || b - a)
    assert.deepEqual(buildTrace(nums).result, expected)
  }
})

test('1636 rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
})
