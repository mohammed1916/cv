import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function greedyReference({ apples, days }) {
  const batches = []
  let eaten = 0
  const horizon = Math.max(...apples.map((_, i) => i + days[i])) + 1
  for (let day = 0; day < horizon; day++) {
    if (day < apples.length && apples[day] > 0) batches.push({ expire: day + days[day], count: apples[day] })
    for (const b of batches) if (b.count > 0 && b.expire > day) { b.count--; eaten++; break }
  }
  return eaten
}

test('1705 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('def eatenApples'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1705 matches an earliest-rot-first reference', () => {
  let seed = 81
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const apples = Array.from({ length: n }, () => rnd(4))
    const days = Array.from({ length: n }, () => rnd(5))
    assert.equal(buildTrace({ apples, days }).result, greedyReference({ apples, days }), JSON.stringify({ apples, days }))
  }
})

test('1705 rejects invalid input', () => {
  assert.throws(() => parseInput('{"apples":[1],"days":[1,2]}'))
  assert.throws(() => parseInput('{"apples":[-1],"days":[1]}'))
})
