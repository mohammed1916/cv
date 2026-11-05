import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function choose(n, k) {
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return r
}

test('1641 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 6)
  assert.ok(python.includes('def countVowelStrings'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1641 equals the closed form C(n+4, 4)', () => {
  for (let n = 1; n <= 50; n++) assert.equal(buildTrace(n).result, choose(n + 4, 4), `n=${n}`)
})

test('1641 rejects invalid input', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('51'))
})
