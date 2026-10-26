import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('649 official examples', () => {
  assert.equal(buildTrace('RD').result, 'Radiant')
  assert.equal(buildTrace('RDD').result, 'Dire')
})

// Oracle: scan the senate cyclically; each live senator bans the next live opponent at or after their position.
function naive(senate) {
  const n = senate.length
  const alive = Array(n).fill(true)
  let i = 0, guard = 0
  const alive_count = c => alive.reduce((k, a, j) => k + (a && senate[j] === c ? 1 : 0), 0)
  while (alive_count('R') && alive_count('D')) {
    if (alive[i % n]) {
      const me = senate[i % n]
      const other = me === 'R' ? 'D' : 'R'
      for (let step = 1; step <= n; step++) {
        const j = (i + step) % n
        if (alive[j] && senate[j] === other) { alive[j] = false; break }
      }
    }
    i++
    if (++guard > 10 * n * n) throw new Error('did not converge')
  }
  return alive_count('R') ? 'Radiant' : 'Dire'
}

test('649 random senates match a naive cyclic simulation', () => {
  let state = 51
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 400; t++) {
    const senate = Array.from({ length: 1 + rand(10) }, () => (rand(2) ? 'R' : 'D')).join('')
    assert.equal(buildTrace(senate).result, naive(senate), senate)
  }
})

test('649 rejects other characters', () => {
  assert.throws(() => parseInput('"RX"'))
})
