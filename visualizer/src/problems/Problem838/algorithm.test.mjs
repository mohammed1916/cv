import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function simulate(s) {
  let cur = s.split('')
  for (;;) {
    const next = [...cur]
    for (let i = 0; i < cur.length; i++) {
      if (cur[i] !== '.') continue
      const l = i > 0 && cur[i - 1] === 'R', r = i < cur.length - 1 && cur[i + 1] === 'L'
      if (l && !r) next[i] = 'R'
      else if (r && !l) next[i] = 'L'
    }
    if (next.join('') === cur.join('')) return cur.join('')
    cur = next
  }
}
test('official examples', () => {
  assert.equal(buildTrace('RR.L').result, 'RR.L')
  assert.equal(buildTrace('.L.R...LR..L..').result, 'LL.RR.LLRRLL..')
})
test('exhaustive against simulation up to length 9', () => {
  const al = ['L', 'R', '.']
  for (let n = 1; n <= 9; n++) for (let m = 0; m < 3 ** n; m++) {
    let s = '', x = m
    for (let i = 0; i < n; i++) { s += al[x % 3]; x = Math.floor(x / 3) }
    const t = buildTrace(s)
    assert.equal(t.result, simulate(s), s)
    assert.equal(t.frames[0].phase, 'start'); assert.equal(t.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('"RXL"')); assert.throws(() => parseInput('5')); assert.throws(() => parseInput('""'))
})
