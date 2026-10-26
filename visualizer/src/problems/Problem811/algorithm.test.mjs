import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Oracle: for every distinct candidate suffix, scan all entries and test endsWith on a dot boundary.
function oracle(arr) {
  const cands = new Set()
  for (const e of arr) { const d = e.split(' ')[1].split('.'); for (let j = 0; j < d.length; j++) cands.add(d.slice(j).join('.')) }
  return [...cands].map(c => {
    let t = 0
    for (const e of arr) { const [n, d] = e.split(' '); if (d === c || d.endsWith('.' + c)) t += Number(n) }
    return `${t} ${c}`
  })
}
test('official examples', () => {
  assert.deepEqual(buildTrace(parseInput('["9001 discuss.leetcode.com"]')).result.sort(), ['9001 com', '9001 discuss.leetcode.com', '9001 leetcode.com'].sort())
  assert.deepEqual(buildTrace(parseInput('["900 google.mail.com","50 yahoo.com","1 intel.mail.com","5 wiki.org"]')).result.sort(),
    ['901 mail.com', '951 com', '900 google.mail.com', '5 wiki.org', '5 org', '1 intel.mail.com', '50 yahoo.com'].sort())
})
test('random vs suffix scan', () => {
  let seed = 4
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  const lab = () => 'abc'[rnd(3)]
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 1 + rnd(6) }, () => `${1 + rnd(99)} ${Array.from({ length: 1 + rnd(3) }, lab).join('.')}`)
    const r = buildTrace(arr)
    assert.deepEqual([...r.result].sort(), oracle(arr).sort())
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('["abc"]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('["0 a.com"]'))
})
