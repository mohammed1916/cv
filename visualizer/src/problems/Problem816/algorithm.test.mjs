import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Oracle: enumerate every comma / decimal-point placement and keep strings matching the canonical-number regex.
const canon = /^(0|[1-9][0-9]*)(\.[0-9]*[1-9])?$/
function oracle(s) {
  const d = s.slice(1, -1), out = []
  const forms = t => {
    const r = [t]
    for (let k = 1; k < t.length; k++) r.push(t.slice(0, k) + '.' + t.slice(k))
    return r.filter(x => canon.test(x))
  }
  for (let i = 1; i < d.length; i++) for (const a of forms(d.slice(0, i))) for (const b of forms(d.slice(i))) out.push(`(${a}, ${b})`)
  return out
}
test('official examples', () => {
  assert.deepEqual(buildTrace(parseInput('"(123)"')).result.sort(), ['(1, 2.3)', '(1, 23)', '(1.2, 3)', '(12, 3)'].sort())
  assert.deepEqual(buildTrace(parseInput('"(0123)"')).result.sort(), ['(0, 1.23)', '(0, 12.3)', '(0, 123)', '(0.1, 2.3)', '(0.1, 23)', '(0.12, 3)'].sort())
  assert.deepEqual(buildTrace(parseInput('"(100)"')).result.sort(), ['(10, 0)'])
})
test('random digit strings vs regex enumeration', () => {
  let seed = 6
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 300; t++) {
    const s = `(${Array.from({ length: 2 + rnd(6) }, () => '0012345'[rnd(7)]).join('')})`
    const r = buildTrace(parseInput(JSON.stringify(s)))
    assert.deepEqual([...r.result].sort(), oracle(s).sort(), s)
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('"123"'))
  assert.throws(() => parseInput('"(1)"'))
  assert.throws(() => parseInput('5'))
})
