import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute({ matrix, k }) {
  const m = matrix.length, n = matrix[0].length
  const values = []
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    let x = 0
    for (let a = 0; a <= i; a++) for (let b = 0; b <= j; b++) x ^= matrix[a][b]
    values.push(x)
  }
  values.sort((a, b) => b - a)
  return values[k - 1]
}

test('1738 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 11)
  assert.ok(python.includes('def kthLargestValue'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1738 matches a direct rectangle XOR', () => {
  assert.equal(buildTrace(parseInput(examples[0].input)).result, 3)
  let seed = 221
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 200; t++) {
    const m = 1 + rnd(4), n = 1 + rnd(4)
    const matrix = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(8)))
    const k = 1 + rnd(m * n)
    assert.equal(buildTrace({ matrix, k }).result, brute({ matrix, k }), JSON.stringify({ matrix, k }))
  }
})

test('1738 rejects invalid input', () => {
  assert.throws(() => parseInput('{"matrix":[[1]],"k":2}'))
  assert.throws(() => parseInput('{"matrix":[[1,2],[3]],"k":1}'))
})
