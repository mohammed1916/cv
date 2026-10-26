import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const brute = s => {
  const idx = [...s].map((c, i) => /[a-zA-Z]/.test(c) ? i : -1).filter(i => i >= 0)
  const out = []
  for (let m = 0; m < 1 << idx.length; m++) {
    const a = [...s]
    idx.forEach((p, b) => { a[p] = m >> b & 1 ? a[p].toUpperCase() : a[p].toLowerCase() })
    out.push(a.join(''))
  }
  return out
}
test('official examples', () => {
  assert.deepEqual(buildTrace('a1b2').result.sort(), ['A1B2', 'A1b2', 'a1B2', 'a1b2'])
  assert.deepEqual(buildTrace('3z4').result.sort(), ['3Z4', '3z4'])
})
test('matches brute force on random strings', () => {
  const chars = 'aBcD1z9Q'
  for (let t = 0; t < 200; t++) {
    const s = Array.from({ length: 1 + Math.floor(Math.random() * 8) }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    const run = buildTrace(s)
    assert.deepEqual([...run.result].sort(), brute(s).sort())
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('"a-b"'))
  assert.throws(() => parseInput('5'))
  assert.throws(() => parseInput('""'))
})
