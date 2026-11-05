import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (bound, call) => buildTrace(parseInput(JSON.stringify({ bound, call }))).result
const PY = python.split('\n')

test('2797 placeholders take call arguments in order and extras go last', () => {
  assert.deepEqual(solve([1, '_', 3, '_'], [2, 4, 5]), [1, 2, 3, 4, 5])
  assert.deepEqual(solve(['_', 'x'], [9]), [9, 'x'])
  assert.deepEqual(solve([], [1, 2]), [1, 2])
})

test('2797 frames point at real python lines', () => {
  for (const f of buildTrace({ bound: ['_', 2], call: [1, 3] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2797 calls do not change the bound arguments', () => {
  const bound = ['_', 'k']
  const first = buildTrace({ bound: [...bound], call: [1] }).result
  const second = buildTrace({ bound: [...bound], call: [7] }).result
  assert.deepEqual(first, [1, 'k'])
  assert.deepEqual(second, [7, 'k'])
})

test('2797 random cases match a direct substitution', () => {
  let seed = 2797
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 200; t++) {
    const bound = Array.from({ length: rnd(5) }, () => (rnd(2) ? '_' : rnd(9)))
    const call = Array.from({ length: rnd(6) }, () => rnd(9))
    const holes = bound.filter(v => v === '_').length
    const filled = [...bound]
    let k = 0
    for (let j = 0; j < filled.length; j++) if (filled[j] === '_') filled[j] = k < call.length ? call[k++] : undefined
    const expected = [...filled.filter(v => v !== undefined || false), ...call.slice(k)]
    if (holes > call.length) continue
    assert.deepEqual(solve(bound, call), expected, JSON.stringify({ bound, call }))
  }
})
