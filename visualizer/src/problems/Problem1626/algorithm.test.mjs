import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute({ scores, ages }) {
  const n = scores.length
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    let total = 0
    let ok = true
    for (let i = 0; i < n && ok; i++) {
      if (!(mask >> i & 1)) continue
      total += scores[i]
      for (let j = 0; j < n; j++) {
        if (!(mask >> j & 1)) continue
        if (ages[i] < ages[j] && scores[i] > scores[j]) ok = false
      }
    }
    if (ok) best = Math.max(best, total)
  }
  return best
}

test('1626 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('def bestTeamScore'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1626 matches brute force on random small inputs', () => {
  let seed = 4
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let trial = 0; trial < 300; trial++) {
    const n = 1 + rnd(7)
    const scores = Array.from({ length: n }, () => 1 + rnd(10))
    const ages = Array.from({ length: n }, () => 1 + rnd(4))
    assert.equal(buildTrace({ scores, ages }).result, brute({ scores, ages }))
  }
})

test('1626 rejects invalid input', () => {
  assert.throws(() => parseInput('{"scores":[1],"ages":[1,2]}'))
  assert.throws(() => parseInput('{"scores":[0],"ages":[1]}'))
})
