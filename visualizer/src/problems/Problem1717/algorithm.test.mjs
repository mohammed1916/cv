import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

// Brute force: try both orders of removing pairs by exhaustive search over choices.
function brute(s, x, y) {
  let best = 0
  const go = (str, score) => {
    best = Math.max(best, score)
    for (let i = 0; i + 1 < str.length; i++) {
      const pair = str.slice(i, i + 2)
      if (pair === 'ab') go(str.slice(0, i) + str.slice(i + 2), score + x)
      if (pair === 'ba') go(str.slice(0, i) + str.slice(i + 2), score + y)
    }
  }
  go(s, 0)
  return best
}

test('1717 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 8)
  assert.ok(python.includes('def maximumGain'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1717 matches exhaustive search on short strings', () => {
  let seed = 131
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(9) }, () => 'ab'[rnd(2)]).join('')
    const x = rnd(10), y = rnd(10)
    assert.equal(buildTrace({ s, x, y }).result, brute(s, x, y), JSON.stringify({ s, x, y }))
  }
})

test('1717 rejects invalid input', () => {
  assert.throws(() => parseInput('{"s":"abc","x":1,"y":1}'))
})
