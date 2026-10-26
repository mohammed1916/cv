import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = a => buildTrace(parseInput(JSON.stringify(a))).result
const val = s => s.join('').replace(/^0+/, '')
const valid = (a, i, j) => i + 1 < j && j <= a.length - 1 && val(a.slice(0, i + 1)) === val(a.slice(i + 1, j)) && val(a.slice(i + 1, j)) === val(a.slice(j))
function exists(a) {
  for (let i = 0; i < a.length; i++) for (let j = i + 2; j < a.length; j++) if (valid(a, i, j)) return true
  return false
}
test('official examples', () => {
  assert.deepEqual(solve([1, 0, 1, 0, 1]), [0, 3])
  assert.deepEqual(solve([1, 1, 0, 1, 1]), [-1, -1])
  assert.deepEqual(solve([1, 1, 0, 0, 1]), [0, 2])
})
test('answers are valid and -1 only when no split exists', () => {
  for (let n = 3; n <= 12; n++) for (let m = 0; m < 1 << n; m++) {
    const a = Array.from({ length: n }, (_, b) => (m >> b) & 1)
    const r = solve(a)
    if (r[0] === -1) assert.equal(exists(a), false, a.join(''))
    else assert.ok(valid(a, r[0], r[1]), `${a.join('')} -> ${r}`)
  }
})
test('ends done, rejects bad input', () => {
  assert.equal(buildTrace(parseInput('[0,0,0]')).frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('[1,2,3]'))
  assert.throws(() => parseInput('[1,0]'))
  assert.throws(() => parseInput('"101"'))
})
