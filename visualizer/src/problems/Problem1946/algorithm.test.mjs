import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (num, change) => buildTrace(parseInput(JSON.stringify({ num, change }))).result
// Try every contiguous block (including the empty one) and keep the largest result.
const brute = (num, change) => {
  let best = num
  for (let i = 0; i < num.length; i++) for (let j = i; j < num.length; j++) {
    const d = [...num].map(Number)
    for (let k = i; k <= j; k++) d[k] = change[d[k]]
    const t = d.join('')
    if (t > best) best = t
  }
  return best
}
const identity = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

test('1946 invented examples', () => {
  assert.equal(solve('132', [9, 8, 5, 0, 3, 6, 4, 2, 6, 8]), '832')
  assert.equal(solve('021', identity), '021')
  assert.equal(solve('5', [0, 1, 2, 3, 4, 0, 6, 7, 8, 9]), '5')
})

test('1946 matches exhaustive block search', () => {
  const maps = [[9, 8, 5, 0, 3, 6, 4, 2, 6, 8], [1, 4, 3, 2, 5, 6, 7, 2, 1, 0], [0, 1, 2, 9, 4, 5, 6, 7, 8, 9]]
  for (const m of maps) for (const n of ['1234', '9081', '5672', '3345', '1111']) assert.equal(solve(n, m), brute(n, m), `${n} ${m}`)
})
