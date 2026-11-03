import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = peaks => buildTrace(peaks).result

test('2345 teaching examples', () => {
  assert.equal(solve([[2, 2], [2, 2], [3, 2]]), 1)
  assert.equal(solve([[5, 5]]), 1)
  assert.equal(solve([[4, 3], [4, 1]]), 1)
})

test('2345 identical peaks hide each other', () => {
  assert.equal(solve([[3, 3], [3, 3]]), 0)
  assert.equal(solve([[3, 3], [3, 3], [9, 1]]), 1)
  assert.equal(solve([[3, 3], [3, 3], [1, 1]]), 0)
})

test('2345 parseInput validates shape and range', () => {
  assert.deepEqual(parseInput('[[1,2],[3,4]]'), [[1, 2], [3, 4]])
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[[1]]'))
  assert.throws(() => parseInput('[[1,0]]'))
})

// Independent geometric oracle: peak j covers peak i when i lies on or under j's slopes.
function oracle(peaks) {
  return peaks.filter(([x, y], i) => !peaks.some(([X, Y], j) => j !== i && Y - y >= Math.abs(x - X))).length
}

test('2345 random inputs match the geometric oracle', () => {
  let seed = 2345
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const peaks = Array.from({ length: 1 + rnd(7) }, () => [rnd(12), 1 + rnd(6)])
    assert.equal(solve(peaks), oracle(peaks), JSON.stringify(peaks))
  }
})

test('2345 frame invariants hold on every trace', () => {
  const peaks = [[4, 3], [1, 1], [9, 4], [4, 1]]
  const run = buildTrace(peaks)
  const phases = new Set(['start', 'pick', 'compare', 'hidden', 'visible', 'done'])
  for (const f of run.frames) {
    assert.ok(phases.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.trim().split('\n').length)
    assert.equal(f.status.length, peaks.length)
    assert.equal(f.left.length, peaks.length)
  }
  assert.equal(run.frames.at(-1).visible, run.result)
})
