import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1640 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 8)
  assert.ok(python.includes('def canFormArray'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1640 agrees with a brute force search over piece orders', () => {
  const orders = list => list.length <= 1 ? [list] : list.flatMap((x, i) => orders([...list.slice(0, i), ...list.slice(i + 1)]).map(rest => [x, ...rest]))
  let seed = 8
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let trial = 0; trial < 150; trial++) {
    const values = [1, 2, 3, 4, 5, 6, 7].sort(() => rnd(2) - 0.5).slice(0, 2 + rnd(5))
    const pieces = []
    let rest = [...values]
    while (rest.length) {
      const len = 1 + rnd(rest.length)
      pieces.push(rest.splice(0, len))
    }
    const arr = pieces.flat()
    const expected = orders(pieces).some(order => order.flat().every((v, i) => v === arr[i]))
    assert.equal(buildTrace({ arr, pieces }).result, expected, JSON.stringify({ arr, pieces }))
  }
})

test('1640 rejects invalid input', () => {
  assert.throws(() => parseInput('{"arr":[1,1],"pieces":[[1],[1]]}'))
  assert.throws(() => parseInput('{"arr":[1,2],"pieces":[[1]]}'))
})
