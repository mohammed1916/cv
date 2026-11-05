import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function reachableMax(start) {
  const seen = new Set([start])
  const stack = [start]
  let best = start
  while (stack.length) {
    const s = stack.pop()
    if (s > best) best = s
    const moves = []
    for (let i = 0; i + 1 < s.length; i++) {
      if (s.slice(i, i + 2) === '00') moves.push(s.slice(0, i) + '10' + s.slice(i + 2))
      if (s.slice(i, i + 2) === '10') moves.push(s.slice(0, i) + '01' + s.slice(i + 2))
    }
    for (const m of moves) if (!seen.has(m)) { seen.add(m); stack.push(m) }
  }
  return best
}

test('1702 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 5)
  assert.ok(python.includes('def maximumBinaryString'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1702 matches an exhaustive search of reachable strings', () => {
  for (let n = 1; n <= 7; n++) {
    for (let bits = 0; bits < 1 << n; bits++) {
      const s = bits.toString(2).padStart(n, '0')
      assert.equal(buildTrace(s).result, reachableMax(s), s)
    }
  }
})

test('1702 rejects invalid input', () => {
  assert.throws(() => parseInput('"012"'))
})
