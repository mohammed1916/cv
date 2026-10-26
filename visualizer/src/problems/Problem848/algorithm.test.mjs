import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Oracle: literally apply each shift to its prefix, one rotation at a time.
function brute(s, shifts) {
  const a = [...s].map(c => c.charCodeAt(0) - 97)
  shifts.forEach((x, i) => { for (let j = 0; j <= i; j++) a[j] = (a[j] + (x % 26)) % 26 })
  return a.map(v => String.fromCharCode(97 + v)).join('')
}
test('official examples', () => {
  assert.equal(buildTrace({ s: 'abc', shifts: [3, 5, 9] }).result, 'rpl')
  assert.equal(buildTrace({ s: 'aaa', shifts: [1, 2, 3] }).result, 'gfd')
})
test('random inputs match prefix-by-prefix application', () => {
  let seed = 17
  const rnd = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) % n }
  for (let t = 0; t < 500; t++) {
    const n = 1 + rnd(12)
    const s = Array.from({ length: n }, () => String.fromCharCode(97 + rnd(26))).join('')
    const shifts = Array.from({ length: n }, () => (rnd(3) ? rnd(60) : rnd(1000000000)))
    const tr = buildTrace(parseInput(JSON.stringify({ s, shifts })))
    assert.equal(tr.result, brute(s, shifts))
    assert.equal(tr.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"s":"ab","shifts":[1]}')); assert.throws(() => parseInput('{"s":"AB","shifts":[1,2]}')); assert.throws(() => parseInput('{"s":"a","shifts":[-1]}'))
})
