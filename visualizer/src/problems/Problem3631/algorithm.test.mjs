import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = threats => buildTrace(threats).result

test('3631 hand-checked order with a tie on score', () => {
  assert.deepEqual(solve([[1, 2, 3], [2, 3, 1], [3, 2, 3], [4, 1, 9]]), [[4, 1, 9], [1, 2, 3], [2, 3, 1], [3, 2, 3]])
  assert.deepEqual(solve([[7, 0, 0]]), [[7, 0, 0]])
})

test('3631 equal scores order by smaller id', () => {
  assert.deepEqual(solve([[5, 1, 1], [2, 0, 3], [9, 1, 1]]).map(t => t[0]), [2, 5, 9])
})

test('3631 rejects duplicate ids and malformed threats', () => {
  assert.throws(() => parseInput('[[1,1,1],[1,2,2]]'))
  assert.throws(() => parseInput('[[1,1]]'))
  assert.throws(() => parseInput('[[1,101,1]]'))
})

test('3631 frames carry valid lines and phases', () => {
  const trace = buildTrace([[1, 2, 3], [2, 3, 1], [3, 2, 3]])
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of trace.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(phaseIds.has(frame.phase))
    assert.equal(frame.order.length, 3)
  }
})

// Oracle: sort by a comparator with the same rule, using Array.prototype.sort.
test('3631 matches a comparator sort on random threats', () => {
  let seed = 3631
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const ids = [...Array(1 + rnd(7)).keys()].map(i => i * 3 + 1)
    const threats = ids.map(id => [id, rnd(6), rnd(6)])
    const expected = [...threats].sort((a, b) => (2 * b[1] + b[2]) - (2 * a[1] + a[2]) || a[0] - b[0])
    assert.deepEqual(solve(threats), expected, JSON.stringify(threats))
  }
})
