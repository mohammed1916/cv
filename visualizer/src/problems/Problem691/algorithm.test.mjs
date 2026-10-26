import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('691 official examples', () => {
  assert.equal(buildTrace({ stickers: ['with', 'example', 'science'], target: 'thehat' }).result, 3)
  assert.equal(buildTrace({ stickers: ['notice', 'possible'], target: 'basicbasic' }).result, -1)
})

// Oracle: enumerate multisets of stickers up to a bound, checking whether together they contain the target letters.
test('691 small instances match exhaustive multisets', () => {
  let state = 9
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const word = len => Array.from({ length: len }, () => 'abc'[rand(3)]).join('')
  for (let t = 0; t < 150; t++) {
    const stickers = Array.from({ length: 1 + rand(3) }, () => word(1 + rand(3)))
    const target = word(1 + rand(4))
    const need = {}
    for (const ch of target) need[ch] = (need[ch] ?? 0) + 1
    let best = -1
    const maxUses = target.length
    function search(i, count, have) {
      if (best !== -1 && count >= best) return
      if (Object.entries(need).every(([ch, n]) => (have[ch] ?? 0) >= n)) { best = count; return }
      if (count === maxUses || i === stickers.length) return
      for (let times = 0; times <= maxUses - count; times++) {
        const next = { ...have }
        for (const ch of stickers[i].repeat(times)) next[ch] = (next[ch] ?? 0) + 1
        search(i + 1, count + times, next)
      }
    }
    search(0, 0, {})
    assert.equal(buildTrace({ stickers, target }).result, best, JSON.stringify({ stickers, target }))
  }
})

test('691 rejects an uppercase target', () => {
  assert.throws(() => parseInput('{"stickers":["a"],"target":"A"}'))
})
