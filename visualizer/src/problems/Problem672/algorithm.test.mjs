import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('672 official examples', () => {
  assert.equal(buildTrace({ n: 1, presses: 1 }).result, 2)
  assert.equal(buildTrace({ n: 2, presses: 1 }).result, 3)
  assert.equal(buildTrace({ n: 3, presses: 1 }).result, 4)
  assert.equal(buildTrace({ n: 3, presses: 2 }).result, 7)
})

// Oracle: the published closed form, which depends only on min(n, 3) and min(presses, 3) for m ≥ 3.
function closedForm(n, m) {
  if (m === 0) return 1
  if (n === 1) return 2
  if (n === 2) return m === 1 ? 3 : 4
  if (m === 1) return 4
  if (m === 2) return 7
  return 8
}

test('672 every small case matches the closed form', () => {
  for (let n = 1; n <= 6; n++) for (let m = 0; m <= 6; m++) assert.equal(buildTrace({ n, presses: m }).result, closedForm(n, m), `n=${n} m=${m}`)
})

test('672 rejects more than six bulbs', () => {
  assert.throws(() => parseInput('{"n":7,"presses":1}'))
})
