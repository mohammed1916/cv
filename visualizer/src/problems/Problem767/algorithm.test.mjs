import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = s => buildTrace(parseInput(JSON.stringify(s)))
const valid = (s, r) => r.length === s.length && [...r].sort().join('') === [...s].sort().join('') && [...r].every((c, i) => i === 0 || c !== r[i - 1])
function perms(s) {
  const out = new Set()
  const go = (rest, cur) => { if (!rest.length) { out.add(cur); return } for (let i = 0; i < rest.length; i++) go(rest.slice(0, i) + rest.slice(i + 1), cur + rest[i]) }
  go(s, '')
  return out
}
test('official examples', () => {
  assert.ok(valid('aab', run('aab').result))
  assert.equal(run('aaab').result, '')
})
test('matches brute-force feasibility', () => {
  let seed = 7
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(7)
    const s = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    const possible = [...perms(s)].some(p => valid(s, p))
    const r = run(s)
    if (possible) assert.ok(valid(s, r.result), s); else assert.equal(r.result, '', s)
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('"AB"'))
  assert.throws(() => parseInput('""'))
  assert.throws(() => parseInput('5'))
})
