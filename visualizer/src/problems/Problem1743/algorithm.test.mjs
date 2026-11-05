import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1743 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('def restoreArray'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1743 restores a chain up to reversal', () => {
  let seed = 231
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(8)
    const chain = Array.from({ length: n }, (_, i) => i * 3 - 7)
    chain.sort(() => rnd(3) - 1)
    const pairs = []
    for (let i = 0; i + 1 < n; i++) pairs.push(rnd(2) ? [chain[i], chain[i + 1]] : [chain[i + 1], chain[i]])
    const got = buildTrace(parseInput(JSON.stringify(pairs))).result
    const ok = JSON.stringify(got) === JSON.stringify(chain) || JSON.stringify(got) === JSON.stringify([...chain].reverse())
    assert.ok(ok, JSON.stringify({ pairs, got, chain }))
  }
})

test('1743 rejects invalid input', () => {
  assert.throws(() => parseInput('[[1,1]]'))
})
