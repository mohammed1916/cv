import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1734 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 8)
  assert.ok(python.includes('def decode'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1734 recovers random odd-length permutations', () => {
  assert.deepEqual(buildTrace(parseInput('[2,3,6,1]')).result, [3, 1, 2, 4, 5])
  let seed = 201
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 * (1 + rnd(8)) + 1
    const perm = Array.from({ length: n }, (_, i) => i + 1).sort(() => rnd(3) - 1)
    const encoded = perm.slice(1).map((v, i) => perm[i] ^ v)
    assert.deepEqual(buildTrace(encoded).result, perm, JSON.stringify(perm))
  }
})

test('1734 rejects invalid input', () => {
  assert.throws(() => parseInput('[1,2,3]'))
  assert.throws(() => parseInput('[0,1]'))
})
