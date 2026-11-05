import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('821 nearest distances match a direct scan', () => {
  let state = 821
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const s = Array.from({ length: 1 + rand(10) }, () => 'ab'[rand(2)]).join('')
    const c = s[rand(s.length)]
    const positions = [...s].map((ch, i) => (ch === c ? i : -1)).filter(i => i >= 0)
    const expected = [...s].map((_, i) => Math.min(...positions.map(p => Math.abs(p - i))))
    assert.deepEqual(buildTrace({ s, c }).result, expected, JSON.stringify({ s, c }))
  }
})

test('821 worked example', () => {
  assert.deepEqual(buildTrace({ s: 'banana', c: 'n' }).result, [2, 1, 0, 1, 0, 1])
})

test('821 rejects a target missing from s', () => {
  assert.throws(() => parseInput('{"s":"abc","c":"z"}'))
})
