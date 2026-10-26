import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('728 official examples', () => {
  assert.deepEqual(buildTrace({ left: 1, right: 22 }).result, [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 22])
  assert.deepEqual(buildTrace({ left: 47, right: 85 }).result, [48, 55, 66, 77])
})

test('728 every range inside 1–300 matches a string-based check', () => {
  const dividing = n => [...String(n)].every(c => c !== '0' && n % Number(c) === 0)
  for (let l = 1; l <= 300; l += 17) for (let r = l; r <= 300; r += 23) {
    const expected = []
    for (let n = l; n <= r; n++) if (dividing(n)) expected.push(n)
    assert.deepEqual(buildTrace({ left: l, right: r }).result, expected, `${l}..${r}`)
  }
})

test('728 rejects a reversed range', () => {
  assert.throws(() => parseInput('{"left":5,"right":3}'))
})
