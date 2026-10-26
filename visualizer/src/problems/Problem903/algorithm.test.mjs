import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result
function brute(s) {
  const n = s.length + 1
  let count = 0
  const used = new Array(n).fill(false)
  const perm = []
  const go = () => {
    if (perm.length === n) { count++; return }
    for (let v = 0; v < n; v++) {
      if (used[v]) continue
      if (perm.length) { const prev = perm[perm.length - 1]; if ((s[perm.length - 1] === 'I') !== (v > prev)) continue }
      used[v] = true; perm.push(v); go(); perm.pop(); used[v] = false
    }
  }
  go()
  return count
}
test('official examples', () => {
  assert.equal(solve('DID'), 5)
  assert.equal(solve('D'), 1)
})
test('matches backtracking brute force', () => {
  for (let len = 1; len <= 8; len++) for (let m = 0; m < 1 << len; m++) {
    const s = Array.from({ length: len }, (_, b) => (m >> b) & 1 ? 'D' : 'I').join('')
    assert.equal(solve(s), brute(s), s)
  }
})
test('ends done, rejects bad input', () => {
  assert.equal(buildTrace(parseInput('"ID"')).frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('"IX"'))
  assert.throws(() => parseInput('""'))
  assert.throws(() => parseInput('5'))
})
