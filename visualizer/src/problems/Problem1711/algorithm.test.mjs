import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute(values) {
  let count = 0
  for (let i = 0; i < values.length; i++) for (let j = i + 1; j < values.length; j++) {
    const s = values[i] + values[j]
    if (s > 0 && (s & (s - 1)) === 0) count++
  }
  return count
}

test('1711 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 10)
  assert.ok(python.includes('def countPairs'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1711 matches the pairwise check', () => {
  let seed = 121
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(12) }, () => rnd(64))
    assert.equal(buildTrace(values).result, brute(values), JSON.stringify(values))
  }
})

test('1711 rejects invalid input', () => {
  assert.throws(() => parseInput('[-1]'))
  assert.throws(() => parseInput('[]'))
})
