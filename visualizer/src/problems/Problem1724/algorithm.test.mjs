import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute({ n, edgeList, queries }) {
  return queries.map(([p, q, limit]) => {
    const seen = new Set([p])
    const stack = [p]
    while (stack.length) {
      const x = stack.pop()
      for (const [u, v, d] of edgeList) {
        if (d >= limit) continue
        const y = u === x ? v : v === x ? u : -1
        if (y >= 0 && !seen.has(y)) { seen.add(y); stack.push(y) }
      }
    }
    return seen.has(q)
  })
}

test('1724 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('class DistanceLimitedPathsExist'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1724 matches a graph search for random queries', () => {
  let seed = 161
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(6)
    const edgeList = Array.from({ length: 1 + rnd(8) }, () => { let u = rnd(n), v = rnd(n); while (v === u) v = rnd(n); return [u, v, 1 + rnd(9)] })
    const queries = Array.from({ length: 1 + rnd(5) }, () => [rnd(n), rnd(n), 1 + rnd(10)])
    const input = { n, edgeList, queries }
    assert.deepEqual(buildTrace(parseInput(JSON.stringify(input))).result, brute(input), JSON.stringify(input))
  }
})

test('1724 rejects invalid input', () => {
  assert.throws(() => parseInput('{"n":2,"edgeList":[[0,0,1]],"queries":[[0,1,2]]}'))
  assert.throws(() => parseInput('{"n":2,"edgeList":[[0,1,1]],"queries":[[0,1,0]]}'))
})
