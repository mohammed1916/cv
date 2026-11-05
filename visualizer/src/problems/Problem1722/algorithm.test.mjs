import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute({ source, target, allowedSwaps }) {
  const n = source.length
  const seen = new Set()
  let best = Infinity
  const go = arr => {
    const key = arr.join(',')
    if (seen.has(key)) return
    seen.add(key)
    best = Math.min(best, arr.reduce((d, v, i) => d + (v !== target[i] ? 1 : 0), 0))
    for (const [a, b] of allowedSwaps) {
      const next = [...arr]; [next[a], next[b]] = [next[b], next[a]]; go(next)
    }
  }
  go([...source])
  return best
}

test('1722 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 12)
  assert.ok(python.includes('def minimumHammingDistance'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1722 matches a search over reachable arrangements', () => {
  let seed = 151
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rnd(4)
    const source = Array.from({ length: n }, () => 1 + rnd(3))
    const target = Array.from({ length: n }, () => 1 + rnd(3))
    const allowedSwaps = []
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rnd(3) === 0) allowedSwaps.push([i, j])
    const input = { source, target, allowedSwaps }
    assert.equal(buildTrace(input).result, brute(input), JSON.stringify(input))
  }
})

test('1722 rejects invalid input', () => {
  assert.throws(() => parseInput('{"source":[1],"target":[1,2],"allowedSwaps":[]}'))
  assert.throws(() => parseInput('{"source":[1,2],"target":[1,2],"allowedSwaps":[[0,0]]}'))
})
