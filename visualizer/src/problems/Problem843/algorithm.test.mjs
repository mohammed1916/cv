import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const match = (a, b) => [...a].filter((c, i) => c === b[i]).length
test('official example solves', () => {
  const r = buildTrace(parseInput('{"words":["acckzz","ccbazz","eiowzz","abcczz"],"secret":"acckzz"}'))
  assert.equal(r.result, true)
})
test('random lists: secret never eliminated, minimax guess verified independently, candidates shrink', () => {
  let seed = 5
  const rnd = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) % n }
  for (let t = 0; t < 200; t++) {
    const set = new Set()
    const size = 1 + rnd(25)
    while (set.size < size) set.add(Array.from({ length: 6 }, () => 'abcd'[rnd(4)]).join(''))
    const words = [...set]
    const secret = words[rnd(words.length)]
    const tr = buildTrace(parseInput(JSON.stringify({ words, secret, allowedGuesses: 10 })))
    let prev = words.length
    for (const f of tr.frames) {
      assert.ok(f.cand.includes(secret))
      if (f.phase === 'choose') {
        // independent minimax: choose candidate minimising its largest bucket, first on ties
        let best = null, bw = 1e9
        for (const w of f.cand) {
          const groups = new Map()
          for (const x of f.cand) groups.set(match(w, x), (groups.get(match(w, x)) || 0) + 1)
          const worst = Math.max(...groups.values())
          if (worst < bw) { bw = worst; best = w }
        }
        assert.equal(f.guess, best)
      }
      if (f.phase === 'ask') { assert.ok(f.cand.length <= prev); prev = f.cand.length }
    }
    assert.equal(tr.result, tr.frames.at(-1).message.includes('found with'))
    if (words.length <= 2) assert.equal(tr.result, true)
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"words":["abc","abcd"],"secret":"abc"}')); assert.throws(() => parseInput('{"words":["abc"],"secret":"xyz"}')); assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"words":["abc","abc"],"secret":"abc"}'))
})
